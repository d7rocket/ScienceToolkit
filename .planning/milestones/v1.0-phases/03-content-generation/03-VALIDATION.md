---
phase: 03
slug: content-generation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual smoke test — SKILL.md workflow, not a testable application |
| **Config file** | None |
| **Quick run command** | `/science [topic]` — run in Claude Code, inspect output file |
| **Full suite command** | Run twice against two different topics |
| **Estimated runtime** | ~60 seconds per topic |

---

## Sampling Rate

- **After every task commit:** Run `/science [topic]` once, inspect output file against all 9 criteria
- **After every plan wave:** Run twice — one science-heavy topic and one space/physics topic
- **Before `/gsd:verify-work`:** Both test runs produce output files where all 9 requirements pass
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CITE-01, CITE-02, CITE-03 | smoke | `/science [topic]` + inspect output | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* No new test framework or stubs needed — the skill itself is the test surface.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 5-7 labeled slide sections | CONT-01 | Output is markdown text, not structured data | Count `## Slide` headings in output file |
| Slide 1 under 10 words | CONT-02 | Word count of free text | Read Slide 1 body, count words |
| Body slides end with cliff-hanger | CONT-03 | Subjective quality check | Read ending of each body slide |
| Caption 400-600 words, keyword first sentence, <2100 chars | CONT-04 | Multiple criteria on free text | Word count + char count + keyword check |
| Exactly 5 hashtags | CONT-05 | Simple count | Count `#` in Hashtags section |
| Cool-professor tone | CONT-06 | Subjective quality | Read aloud; check for jargon without gloss |
| Full APA citations with DOI/authors/date | CITE-01 | Citation completeness check | Inspect each source entry |
| Clickable URLs per citation | CITE-02 | URL presence check | Confirm `URL: https://` per citation |
| At least one source image URL | CITE-03 | Image section check | Inspect Images section |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
