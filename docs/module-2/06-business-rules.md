# Business Rules

- **BR-01 — Clinical ownership:** AI output is advisory draft content. The doctor is
  responsible for the final clinical record.
- **BR-02 — Patient binding:** A session cannot begin without a selected patient.
- **BR-03 — Encounter continuity:** Switching presentation mode or device must not
  create a new encounter.
- **BR-04 — Consent gate:** Capture can begin only after the doctor records that the
  patient or legal representative consented through an allowed method.
- **BR-05 — Optional consent audio:** Consent audio is required only when the selected
  method is audio and hospital configuration allows it.
- **BR-06 — Consent independence:** Consent evidence is separate from the clinical
  conversation transcript.
- **BR-07 — Right to refuse:** Refusal does not affect access to care and must leave a
  non-recording workflow available.
- **BR-08 — Draft state:** Every AI-generated clinical summary is unconfirmed by default.
- **BR-09 — Confirmation gate:** Sharing, HIS sync, and PDF export require confirmation.
- **BR-10 — Confirmation acknowledgement:** The doctor must explicitly attest to
  reviewing identity, medication, allergy, and AI content.
- **BR-11 — Immutability:** A confirmed record is read-only; later change requires a
  separate amendment/versioning process.
- **BR-12 — Independent outputs:** Patient sharing, internal collaboration, PDF export,
  and HIS sync do not implicitly trigger one another.
- **BR-13 — Share isolation:** Changes to outgoing patient communication do not alter
  the confirmed record or HIS content.
- **BR-14 — Context isolation:** Reference material supports generation but is not
  automatically conversation evidence or HIS data.
- **BR-15 — Failure preservation:** HIS failure must not invalidate or remove a confirmed
  record.
