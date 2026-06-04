import pLimit from "p-limit";
import { createServiceLogger } from "@/lib/utils/logging/logger";
import { isRetryableBlockchainError, withRetry } from "./retry";

const log = createServiceLogger("ChainReadClient");

type ReadKind = "read" | "event";

interface ReadOptions {
  label: string;
  kind?: ReadKind;
  maxAttempts?: number;
}

interface BatchOptions {
  label: string;
  kind?: ReadKind;
  maxAttempts?: number;
}

interface EventChunkOptions<TEvent> {
  label: string;
  fromBlock: number;
  toBlock: number;
  chunkSize?: number;
  minChunkSize?: number;
  direction?: "asc" | "desc";
  query: (fromBlock: number, toBlock: number) => Promise<TEvent[]>;
  shouldContinue?: (events: TEvent[], allEvents: TEvent[]) => boolean;
}

interface ChainReadStats {
  reads: number;
  eventReads: number;
  failures: number;
}

const READ_CONCURRENCY = 3;
const EVENT_CONCURRENCY = 1;
const READ_DELAY_MS = 120;
const EVENT_DELAY_MS = 180;
const DEFAULT_EVENT_CHUNK_SIZE = 50_000;
const DEFAULT_MIN_EVENT_CHUNK_SIZE = 499;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRangeTooLargeError(error: unknown): boolean {
  const message = String(error).toLowerCase();
  return (
    message.includes("cannot get more than") ||
    message.includes("invalid getlogs") ||
    message.includes("invalid get logs") ||
    message.includes("block range") ||
    message.includes("block range is too large")
  );
}

class ChainReadClient {
  private readLimiter = pLimit(READ_CONCURRENCY);
  private eventLimiter = pLimit(EVENT_CONCURRENCY);
  private lastReadAt = 0;
  private lastEventAt = 0;
  private stats: ChainReadStats = {
    reads: 0,
    eventReads: 0,
    failures: 0,
  };

  async read<T>(operation: () => Promise<T>, options: ReadOptions): Promise<T> {
    const kind = options.kind ?? "read";
    const limiter = kind === "event" ? this.eventLimiter : this.readLimiter;

    return limiter(async () => {
      await this.applyDelay(kind);

      try {
        const result = await withRetry(operation, {
          maxAttempts: options.maxAttempts ?? 3,
          initialDelay: kind === "event" ? 900 : 500,
          maxDelay: kind === "event" ? 8_000 : 5_000,
          shouldRetry: isRetryableBlockchainError,
          onRetry: (attempt, error) => {
            log.warn("Retrying chain read", {
              label: options.label,
              kind,
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        });

        if (kind === "event") {
          this.stats.eventReads++;
        } else {
          this.stats.reads++;
        }

        return result;
      } catch (error) {
        this.stats.failures++;
        log.warn("Chain read failed", {
          label: options.label,
          kind,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    });
  }

  async readBatch<TItem, TResult>(
    items: TItem[],
    mapper: (item: TItem, index: number) => Promise<TResult>,
    options: BatchOptions,
  ): Promise<TResult[]> {
    const reads = items.map((item, index) =>
      this.read(() => mapper(item, index), {
        label: `${options.label}:${index}`,
        kind: options.kind,
        maxAttempts: options.maxAttempts,
      }),
    );

    return Promise.all(reads);
  }

  async readEventChunks<TEvent>(
    options: EventChunkOptions<TEvent>,
  ): Promise<TEvent[]> {
    const direction = options.direction ?? "desc";
    const minChunkSize = options.minChunkSize ?? DEFAULT_MIN_EVENT_CHUNK_SIZE;
    let chunkSize = Math.max(
      minChunkSize,
      options.chunkSize ?? DEFAULT_EVENT_CHUNK_SIZE,
    );
    const allEvents: TEvent[] = [];

    if (direction === "asc") {
      let from = options.fromBlock;
      while (from <= options.toBlock) {
        const to = Math.min(options.toBlock, from + chunkSize);
        try {
          const events = await this.read(() => options.query(from, to), {
            label: `${options.label}:${from}-${to}`,
            kind: "event",
          });
          allEvents.push(...events);
          if (options.shouldContinue?.(events, allEvents) === false) break;
          from = to + 1;
        } catch (error) {
          if (!isRangeTooLargeError(error) || chunkSize <= minChunkSize) {
            throw error;
          }
          chunkSize = Math.max(minChunkSize, Math.floor(chunkSize / 2));
          log.warn("Reducing event chunk size", {
            label: options.label,
            chunkSize,
          });
        }
      }
      return allEvents;
    }

    let to = options.toBlock;
    while (to >= options.fromBlock) {
      const from = Math.max(options.fromBlock, to - chunkSize);
      try {
        const events = await this.read(() => options.query(from, to), {
          label: `${options.label}:${from}-${to}`,
          kind: "event",
        });
        allEvents.push(...events);
        if (options.shouldContinue?.(events, allEvents) === false) break;
        to = from - 1;
      } catch (error) {
        if (!isRangeTooLargeError(error) || chunkSize <= minChunkSize) {
          throw error;
        }
        chunkSize = Math.max(minChunkSize, Math.floor(chunkSize / 2));
        log.warn("Reducing event chunk size", {
          label: options.label,
          chunkSize,
        });
      }
    }

    return allEvents;
  }

  getStats(): ChainReadStats {
    return { ...this.stats };
  }

  private async applyDelay(kind: ReadKind): Promise<void> {
    const now = Date.now();
    const lastAt = kind === "event" ? this.lastEventAt : this.lastReadAt;
    const delay = kind === "event" ? EVENT_DELAY_MS : READ_DELAY_MS;
    const elapsed = now - lastAt;

    if (elapsed < delay) {
      await sleep(delay - elapsed);
    }

    if (kind === "event") {
      this.lastEventAt = Date.now();
    } else {
      this.lastReadAt = Date.now();
    }
  }
}

export const chainReadClient = new ChainReadClient();
