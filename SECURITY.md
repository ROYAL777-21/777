# Security Policy

## Reporting a vulnerability

Please report privately via **GitHub Security Advisories** (Security tab →
"Report a vulnerability") rather than opening a public issue. Include
reproduction steps and affected paths; we aim to respond within 72 hours.

## What we commit to

- **No secrets in the repo.** `.env` is gitignored; CI fails if it is ever
  committed. The red-team script scans for key material on every release.
- **Passwords are never plaintext** — PBKDF2-SHA256 (150k iterations, per-account
  salt, WebCrypto) even in the demo auth provider; the real provider hashes
  server-side with argon2 or equivalent.
- **Rewards can't be forged.** Every referral/milestone/entitlement grant runs
  inside a database transaction with unique keys — parallel or replayed calls
  cannot double-award. The client can never mint entitlements; Pro is applied
  server-side only.
- **Bounded inputs.** API routes cap body sizes, validate actions, and rate-limit
  share/join counters per day.
- **Hardened responses.** nosniff, SAMEORIGIN framing, no-referrer,
  permissions-policy, COOP headers; API responses are no-store.
- **Dependency hygiene.** Dependabot (npm + cargo + actions) and a dependency
  audit in CI; the audit job fails the build on high-severity findings.

## In this repository

- Full threat model & hardening notes: [docs/SECURITY.md](./docs/SECURITY.md)
- Red-team script: `bun run redteam` (scripts/redteam.sh)
- Headers: `next.config.ts`
