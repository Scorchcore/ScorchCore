# Scorchcore-v2 Review Rules

- Use TypeScript strict typing and avoid introducing `any`.
- Preserve the service, facade, query, and contract-factory layers.
- Use `wagmi`/`viem` for wallet integration and existing `ethers` wrappers for contract facades.
- Keep Ronin Saigon chain ID `202601` and deployment addresses centralized in `src/lib/config`.
- Never expose secrets, private keys, wallet credentials, or sensitive runtime data.
- Never expose application or dependency console output in production builds.
- Keep user-facing transaction errors actionable without logging sensitive payloads.
- Read protocol fees, oracle prices, feature flags, and contract state dynamically where supported.
- Keep tests with the behavior they verify.
- Run `pnpm exec tsc --noEmit`, `pnpm exec vitest run`, and `pnpm build` before delivery.
