# End-to-End Workflows

## Standard clinical workflow

```text
Launch from HIS or Standalone
→ resolve patient and encounter
→ load/add reference context
→ choose document template
→ explain recording and record consent
→ start ambient recording
→ pause/resume or continue in floating window
→ finish consultation
→ save audio
→ generate transcript
→ generate structured draft
→ doctor reviews evidence and edits
→ doctor confirms clinical review
→ confirmed record becomes read-only
→ independently sync HIS, share, invite doctor, or export PDF
```

The capture-to-confirmation segment is owned by MV-195. HIS/EMR entry is owned by
MV-260, standalone entry by MV-258, cross-department context by MV-259, and result
sharing by MV-261.

## Cross-department workflow

```text
Resolve current patient and encounter
→ list permitted prior department encounters
→ clinician selects relevant context
→ record selected sources and review status
→ generate the current encounter draft
→ clinician reviews and confirms the current record independently
```

Separate department encounters must not be merged into one clinical record merely
because they belong to the same patient journey.

## Consent-refusal workflow

```text
Patient refuses recording
→ refusal is recorded
→ recording remains disabled
→ doctor continues normal examination without recording
   or enters a post-visit recap
→ AI creates a draft explicitly labelled as recap-derived
→ doctor reviews and confirms normally
```

## Embedded workflow

The embedded panel uses the same consent and recording requirements. After processing,
the doctor first sees a compact result, may review and edit the compact summary, then
confirms it. Full workspace is available whenever broader source comparison is needed.

## Standalone workflow

```text
Login
→ personal worklist
→ create session
→ select existing patient or create minimal patient
→ attach/reference supporting context
→ perform standard clinical workflow
→ return to worklist
```

## Exit while recording

When the doctor attempts to leave during capture, MedVita must not silently abandon
the session. The doctor chooses either to pause and exit or, where supported, continue
recording in a floating window. If the browser lacks the floating-window capability,
the doctor must remain or pause.
