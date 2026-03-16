---
phase: 2
slug: source-fetching
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual smoke tests (SKILL.md workflow — no code test framework) |
| **Config file** | none |
| **Quick run command** | `/science quantum computing` |
| **Full suite command** | `/science quantum computing` then `/science gene therapy` |
| **Estimated runtime** | ~30 seconds per run |

---

## Sampling Rate

- **After every task commit:** Run `/science [topic]` once, inspect output file
- **After every plan wave:** Run `/science [topic]` twice against two different topics
- **Before `/gsd:verify-work`:** Both test runs produce output files meeting all success criteria
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | FETCH-01 | smoke | `/science [topic]` → inspect Sources for news article | N/A | ⬜ pending |
| 02-01-02 | 01 | 1 | FETCH-02 | smoke | `/science [topic]` → inspect Sources for academic citation | N/A | ⬜ pending |
| 02-01-03 | 01 | 1 | CITE-04 | smoke | `/science [topic]` → verify arXiv label `[Preprint - not peer reviewed]` | N/A | ⬜ pending |
| 02-01-04 | 01 | 1 | CITE-05 | smoke | `/science [topic]` → inspect Images section labels | N/A | ⬜ pending |
| 02-01-05 | 01 | 1 | FETCH-04 | smoke | `/science [topic]` → check cross-source linking note | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* No new test framework needed — this is a SKILL.md workflow verified by manual smoke tests.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| News articles fetched from ≥1 news source | FETCH-01 | SKILL.md output inspection | Run `/science [topic]`, verify Sources section has ScienceDaily/Nature/Phys.org entry |
| Academic content from arXiv/PubMed | FETCH-02 | SKILL.md output inspection | Run `/science [topic]`, verify Sources section has arXiv or PubMed citation |
| Cross-source linking | FETCH-04 | Requires semantic match judgment | Run `/science [topic]`, check for "same finding" note linking academic + news |
| Preprint label on arXiv | CITE-04 | SKILL.md output inspection | Run `/science [topic]`, verify arXiv source shows `[Preprint - not peer reviewed]` |
| Image license labels | CITE-05 | SKILL.md output inspection | Run `/science [topic]`, verify image URLs have `[CC-licensed]` or `[Copyrighted]` label |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
