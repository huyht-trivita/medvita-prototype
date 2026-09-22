# PO/BA Assistant Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one portable PO/BA Agent Skill shared by Codex and Claude Code inside `medvita-prototype`.

**Architecture:** Keep the canonical skill in `.agents/skills/po-ba-assistant` and expose it to Claude Code through a relative symlink under `.claude/skills`. Keep the main `SKILL.md` concise and route deliverable-specific guidance to focused reference files.

**Tech Stack:** Markdown, YAML frontmatter, POSIX symbolic link, Bash validation, Git.

**Spec:** `docs/superpowers/specs/2026-09-11-po-ba-assistant-design.md`

## Global Constraints

- `.agents/skills/po-ba-assistant` is the only canonical copy.
- `.claude/skills/po-ba-assistant` must be a relative symbolic link.
- Default output language is Vietnamese unless the user requests another language.
- Jira outputs must apply the four user-defined Jira rules from the spec.
- The skill must not invent requirements, research data, status, or stakeholder decisions.
- No external mutation is authorized merely by invoking the skill.

---

### Task 1: Baseline scenarios and validation contract

**Files:**
- Create: `tests/scenarios.md`
- Create: `tests/validate_skill.sh`

- [ ] Write representative failing baseline examples based on observed PO/BA output failures.
- [ ] Write validation assertions for frontmatter, routing, references, Jira rules, and symlink identity.
- [ ] Run `bash tests/validate_skill.sh` and verify it fails because the skill does not exist.
- [ ] Commit the RED test contract.

### Task 2: Canonical skill and routing

**Files:**
- Create: `.agents/skills/po-ba-assistant/SKILL.md`
- Create: `.agents/skills/po-ba-assistant/references/jira-requirements.md`
- Create: `.agents/skills/po-ba-assistant/references/product-discovery.md`
- Create: `.agents/skills/po-ba-assistant/references/process-analysis.md`
- Create: `.agents/skills/po-ba-assistant/references/healthcare-ba.md`
- Create: `.agents/skills/po-ba-assistant/references/reporting.md`

- [ ] Write minimal routing and shared output rules in `SKILL.md`.
- [ ] Add focused instructions, output contracts, examples, and common mistakes to each reference.
- [ ] Run validation and verify only the missing Claude symlink remains failing.
- [ ] Commit the canonical skill.

### Task 3: Claude Code compatibility

**Files:**
- Create: `.claude/skills/po-ba-assistant` as a symbolic link.

- [ ] Create relative symlink `../../.agents/skills/po-ba-assistant`.
- [ ] Resolve both paths with `realpath` and verify they point to the same directory.
- [ ] Run full validation and verify all assertions pass.
- [ ] Commit Claude Code compatibility.

### Task 4: Package verification and delivery

**Files:**
- Create: `po-ba-assistant-portable.zip`

- [ ] Run the official skill quick validator against the canonical skill.
- [ ] Run `bash tests/validate_skill.sh` fresh and inspect the complete output.
- [ ] Inspect `git status`, `git diff --check`, symlink metadata, and repository tree.
- [ ] Create a portable ZIP that preserves the symlink.
- [ ] Verify ZIP contents and checksum.
- [ ] Commit final test refinements, if any, and save the deliverable.
