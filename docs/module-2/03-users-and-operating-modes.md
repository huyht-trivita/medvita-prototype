# Users and Operating Modes

## Primary user

The doctor conducts the examination, records consent, controls capture, reviews AI
output, edits the draft, confirms the clinical record, and chooses downstream actions.

## Other actors

- **Patient:** participates in the recorded conversation, grants or refuses consent,
  and may receive a patient-facing summary.
- **Legal representative:** may provide consent on the patient's behalf.
- **Invited doctor:** belongs to the same hospital and receives read-only access.
- **HIS/EHR:** provides patient/encounter context and receives the confirmed record.
- **MedVita AI:** creates transcript and structured draft; it never confirms content.

## Operating modes

### Embedded in HIS

The recommended launch opens a compact MedVita panel without leaving the HIS record.
Patient and encounter context are inherited. Capture, compact review, confirmation,
sharing, and HIS sync can occur in the panel. A full workspace remains available for
deeper evidence review.

### Full workspace from HIS

The doctor enters the complete MedVita workspace while retaining the same HIS patient
and encounter. This mode emphasises transcript evidence, editing, and post-confirmation
actions.

### QR/mobile handoff

A QR launch opens the same encounter on a phone-sized workspace. It is a device
handoff, not a new patient or session.

### Standalone application

The doctor authenticates independently, sees a personal worklist, chooses or creates
a patient, and creates a session. Standalone mode adds reference context and session
management because HIS does not provide these automatically.

Standalone and HIS-linked use are separate Jira scope areas (MV-258 and MV-260).
They share consent, draft and confirmation gates but differ in how patient,
encounter, hospital and reference context are established.

## Cross-department operation

MV-259 defines cross-department information management as a separate concern. Each
department interaction remains a distinct encounter unless an approved hospital
workflow defines otherwise. Prior summaries are reference context: their source and
review status remain visible, and an earlier AI summary is not silently treated as
verified clinical fact.

## Session worklist states

- **Needs action:** review-required and draft sessions.
- **Completed:** confirmed sessions.
- **All:** combined history.

Confirmed historical sessions open read-only. Draft sessions can be resumed, and
review-required sessions can be opened for confirmation.
