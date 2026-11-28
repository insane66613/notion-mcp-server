# Notion webhook retirement (2026-11-28)

This release candidate removes dormant Notion webhook ingestion and reconciliation from the 3.6.0 source branch `ed7e420ebab86da935331d222de7cba0744e5433`. The owner retired the feature after an audit found no verified active Notion subscription or configured delivery. Historical work remains in the closed upstream PR #157 and preserved isolated worktrees; do not recreate those components.

The MCP read/write API, four account profiles, Markdown v2, Quick Filters, saved dashboard views, idempotency and existing SanityCloud overlays must remain unchanged. `NOTION_WEBHOOK_CONFIG_JSON` is rejected explicitly on startup instead of activating a retired feature. Requests to `/webhooks/notion/` return 404. The ElevenLabs webhook on port 8795 is unrelated and must remain untouched.

## Candidate validation

- Node 24 on Windows, PowerShell 7
- `npm ci --offline --ignore-scripts --no-audit --no-fund`: PASS
- `npm run build`: PASS
- Focused HTTP/configuration tests: 35 passed
- Full source suite: 50 files, 1,126 passed / 10 skipped
- No changes to the current running service or Portal

## Cutover and recovery gate

Do not deploy from an uncommitted worktree. Build a pinned, hash-verified package from the reviewed exact HEAD; preserve all nine compiled overlays and the current live state, runner, credentials and rollback snapshots. The existing Portal-owned launcher currently reinstalls a 3.6.0 vendor package and recopies the older multi-account wrapper at startup. A file-only removal is therefore NOT a durable cutover.

Before activation, reconcile a service-only immutable launcher/pointer without restarting Portal or touching other providers. Require native initialize/tools/list/get_self across all four configured account profiles, read-only Quick Filters and Markdown acceptance, an explicit 404 for the retired route, and protected external MCP authentication. Record process image, source and package SHA; retain a tested service-only rollback. If launcher ownership cannot be safely decoupled, keep production unchanged and record HOLD.
