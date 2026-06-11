"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import type React from "react";
import { useState } from "react";

/**
 * Emotion SSR registry para Next.js App Router.
 *
 * El Tanto Widget usa @emotion/react; sin un cache propio, emotion inserta
 * <style> inline en el HTML del servidor (junto al componente) mientras que
 * en el cliente los inyecta en <head>, provocando hydration mismatch.
 * Este registry recolecta los estilos SSR y los emite vía
 * useServerInsertedHTML, igualando servidor y cliente.
 */
export function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const emotionCache = createCache({ key: "tanto" });
    emotionCache.compat = true;

    const prevInsert = emotionCache.insert;
    let inserted: string[] = [];
    emotionCache.insert = (...args) => {
      const serialized = args[1];
      if (emotionCache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flushNames = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };

    return { cache: emotionCache, flush: flushNames };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;
    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: estilos generados por emotion, no input de usuario
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
