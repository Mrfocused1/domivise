# DomiVise Agent Guardrails

These instructions apply to all Codex work in this repository.

## Identity And Account Privacy

- Never use, submit, connect, sync, email, test with, or configure any personal identity blocked by `scripts/privacy-guard.mjs` unless the user explicitly asks for that exact identity in the same turn.
- Do not use personal inboxes for QA. Use neutral addresses such as `qa@example.invalid`, stub network calls, or ask the user for an approved test recipient.
- Before sending any real email, syncing any contact, creating any account, pushing env changes, or triggering a production workflow, verify the destination is approved for DomiVise and does not match the blocked identity.
- Do not expose personal identities in code, comments, logs, commits, analytics rows, Supabase content, Resend contacts, email notifications, screenshots, or final reports.

## Required Check

Run this before commits, pushes, production deploys, or real external API tests:

```sh
node scripts/privacy-guard.mjs
```

If it fails, stop and remove the blocked identity before continuing.
