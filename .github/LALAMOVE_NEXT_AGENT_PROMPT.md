[START] READ AND FOLLOW AND EDIT AND UPDATE:
c:\Users\ADMIN\Desktop\PP Namias\MASH\MASH-Ecommerce\.github\LALAMOVE_NEXT_AGENT_PROMPT.md

## [RALPH] Lalamove Realtime Hardening Loop

Ralph is a fully autonomous AI loop. Continue on branch `feature/lalamove-realtime`.
Memory source of truth: `progress.txt`, `prd-lalamove-realtime.json`, and git history.

Primary directives:
1. Read and obey `copilot-instructions.md`.
2. Read `progress.txt` first on every run.
3. Reconcile PRD state with actual code before writing code.
4. Sandbox-first for all Lalamove behavior (`LALAMOVE_HOST` must contain `sandbox`).
5. Keep commits small, technical, and scoped.

Execution workflow:
1. Read `progress.txt` and `prd-lalamove-realtime.json`.
2. Determine the next true test/coverage gap for Lalamove realtime lifecycle.
3. Implement focused tests and minimal supporting code changes only when required.
4. Run targeted tests immediately for touched files.
5. Update `prd-lalamove-realtime.json` and append concise notes to `progress.txt`.
6. Commit with story/test batch ID.

Mandatory quality gates:
1. `npm run build`
2. `npm run lint`
3. `npx tsc --noEmit`
4. `npm run test`
5. If available, run relevant delivery flow E2E tests.
6. If global failures are pre-existing, list exact failing files and prove no regressions from current changes.

Hard rules:
1. No `any`.
2. No `ts-ignore`.
3. No `eslint-disable`.
4. No unrelated file edits.
5. Keep accessibility and responsive behavior intact.
6. Keep design consistent with MASH delivery patterns.

Completion definition:
1. All Lalamove stories in `prd-lalamove-realtime.json` are marked complete and validated.
2. Route, hook, and page flow tests cover sandbox lifecycle and webhook transitions.
3. No delivery regressions.
4. Final report includes: files changed, tests run, and any unrelated blockers.

---

## Copy-Paste Next-Step Prompt

Use the prompt below in the next agent run:

```text
You are RALPH continuing on branch feature/lalamove-realtime.

Mission:
Harden Lalamove end-to-end sandbox confidence by adding more unit/integration-style flow tests, especially around route lifecycle transitions and webhook-driven state changes.

Read first (in order):
1) progress.txt
2) prd-lalamove-realtime.json
3) .github/LALAMOVE_NEXT_AGENT_PROMPT.md

Already completed in recent batch:
- Expanded src/app/lalamove-test/__tests__/page.test.tsx with stronger payload + flow assertions.
- Added lifecycle assertions in src/app/api/lalamove/__tests__/lalamove-routes.test.ts:
  - sandbox simulate DRIVER_ASSIGNED writes ON_GOING tracking
  - non-sandbox host blocks simulator (403)
  - sandbox-to-webhook transition DRIVER_PICKED_UP updates tracking + order status
  - ORDER_COMPLETED transition updates tracking + delivered status

Next batch required now:
1. Add more route-level lifecycle tests for failure and edge transitions in src/app/api/lalamove/__tests__/lalamove-routes.test.ts:
	- webhook signature mismatch path in lifecycle context
	- order lookup miss during transition (no Firestore order)
	- canceled lifecycle path confirms tracking cancel state without delivered/shipped status updates
2. Add transition-focused assertions to ensure timeline/driver data is preserved when moving ON_GOING -> PICKED_UP -> COMPLETED where applicable.
3. Add at least 8-12 new tests in this batch, focused on realistic sandbox flows.
4. Run targeted tests for:
	- src/app/api/lalamove/__tests__/lalamove-routes.test.ts
	- src/app/api/lalamove/webhook/__tests__/webhook-route.test.ts
	- src/app/api/lalamove/sandbox-simulate/__tests__/sandbox-simulate-route.test.ts
	- src/app/lalamove-test/__tests__/page.test.tsx
5. If all targeted tests pass, commit in one small technical commit.

Commit message format:
LAMA-TEST: <technical scope>

Then output:
- Files changed
- Number of tests added
- Targeted test results
- Any pre-existing blockers
```

[CONTINUE]
Start now. Reconcile PRD state against code, implement the next Lalamove flow-test batch, validate, and commit.