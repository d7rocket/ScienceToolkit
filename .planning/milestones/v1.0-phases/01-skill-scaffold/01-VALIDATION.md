---
phase: 1
slug: skill-scaffold
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Phase 1 is pure markdown files, no executable code |
| **Config file** | N/A |
| **Quick run command** | Run `/science [topic]` in Claude Code and inspect output |
| **Full suite command** | Verify `examples/output-sample.md` exists and matches all format rules; run `/science` end-to-end |
| **Estimated runtime** | ~30 seconds (manual inspection) |

---

## Sampling Rate

- **After every task commit:** Visual inspection — does the file match the format spec?
- **After every plan wave:** Full walkthrough — does `/science [topic]` run, confirm, write to disk, and print the terminal summary?
- **Before `/gsd:verify-work`:** Both FETCH-03 and CONT-07 confirmed
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | CONT-07 | manual | Inspect `examples/output-sample.md` sections | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | FETCH-03 | manual | Read `prompts/system.md` for grounding rules | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | CONT-07 | manual | Run `/science` and inspect output file | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.claude/skills/science/SKILL.md` — skill entrypoint (does not exist yet)
- [ ] `.claude/skills/science/prompts/system.md` — grounding enforcement prompt (does not exist yet)
- [ ] `examples/output-sample.md` — canonical format contract (does not exist yet)
- [ ] `output/` — output directory (does not exist yet)

*All Wave 0 gaps are expected — this is a greenfield project. Phase 1 creates all of them.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Generated content does not cite LLM-memory sources | FETCH-03 | No executable code to test; grounding is an instruction-level constraint | Read `prompts/system.md` — confirm it contains explicit prohibition of memory-based citations |
| Output has clearly labeled sections | CONT-07 | Output is markdown; validation is structural inspection | Run `/science [topic]`, open output file, verify H2 sections: Slide 1..N, Caption, Hashtags, Sources, Images |
| Sample output matches format contract | CONT-07 | Format contract is a markdown spec, not testable code | Compare `examples/output-sample.md` against format spec in research: metadata block, slides, caption (<2100 chars), hashtags, sources with citation variants |

---

## Validation Sign-Off

- [ ] All tasks have manual verify instructions or Wave 0 dependencies
- [ ] Sampling continuity: manual inspection at every task commit
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
