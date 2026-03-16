---
phase: 04
slug: validation-and-auto-topic
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual smoke test (Claude skill — Markdown instruction file, not a program) |
| **Config file** | None |
| **Quick run command** | `/science` (no args) — observe auto-discovery flow |
| **Full suite command** | Run 3 scenarios: (1) `/science` no args, (2) `/science [topic]` with topic in log, (3) `/science [topic]` with topic not in log |
| **Estimated runtime** | ~60-90 seconds per scenario (includes RSS fetch latency) |

---

## Sampling Rate

- **After every task commit:** Run `/science` with no args, confirm flow works end-to-end
- **After every plan wave:** Run all 3 scenarios above
- **Before `/gsd:verify-work`:** All 3 scenarios pass
- **Max feedback latency:** ~90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | TOPIC-01 | manual smoke | `/science` no args — verify RSS scan + confirm | N/A | ⬜ pending |
| 04-01-02 | 01 | 1 | TOPIC-02 | manual smoke | Pre-populate topic-log.json, run `/science` — verify skip | N/A | ⬜ pending |
| 04-01-03 | 01 | 1 | TOPIC-02 | manual smoke | `/science [topic-in-log]` — verify warn but proceed | N/A | ⬜ pending |
| 04-01-04 | 01 | 1 | TOPIC-01+02 | manual smoke | Run `/science` twice — verify log has 2 entries | N/A | ⬜ pending |
| 04-02-01 | 02 | 1 | Validation | manual smoke | Normal run — verify Step 7 shows "Validation: PASS" | N/A | ⬜ pending |
| 04-02-02 | 02 | 1 | Validation | manual smoke | Inspect output file — verify no warning section on clean run | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — no test files needed. This is a Claude skill (Markdown instruction file), not a program. Testing is manual invocation and output inspection.

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Auto-topic discovery presents RSS-sourced topic | TOPIC-01 | Claude skill — no unit test framework | Run `/science` with no args; verify "Today's topic: X (covered by Feed1, Feed2). Proceed?" appears |
| Cross-feed frequency ranking | TOPIC-01 | Requires real RSS feeds; ranking is semantic | Confirm presented topic appeared in 2+ feeds |
| 14-day dedup skips recent topic | TOPIC-02 | Requires pre-populated log file | Pre-populate `output/topic-log.json` with today's date + candidate; verify skip message |
| Manual topic warns on recent coverage | TOPIC-02 | Interactive UX flow | Run `/science CRISPR` when CRISPR is in log; verify warning appears |
| topic-log.json append not overwrite | TOPIC-02 | Requires sequential runs | Run `/science` twice; inspect log for 2 entries |
| Validation PASS on clean output | Validation | Requires complete generation run | Normal run; check Step 7 terminal output for "Validation: PASS" |
| Validation FAIL with warning prepended | Validation | Hard to trigger mechanically | Review output file for `> [!WARNING]` block when violations exist |

---

## Validation Sign-Off

- [ ] All tasks have manual smoke test verification
- [ ] Sampling continuity: every task has a verification step
- [ ] Wave 0 covers all MISSING references (N/A — no wave 0 needed)
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
