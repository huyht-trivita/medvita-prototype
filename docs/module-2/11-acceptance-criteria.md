# Acceptance Criteria

## Entry and context

- **AC-01:** Given a HIS encounter, choosing embedded, full, or QR mode preserves the
  same patient and encounter identifiers.
- **AC-02:** Given standalone mode, creating a session requires selecting or creating
  a patient before opening capture.
- **AC-03:** Prior visits and added reference material remain attached to the selected
  patient/session and are visibly labelled as reference context.

## Consent

- **AC-04:** Recording cannot start until the doctor confirms consent by an allowed method.
- **AC-05:** When audio consent is selected, recording cannot start until separate consent
  audio exists.
- **AC-06:** The consent audit displays consenting party, method, doctor, time, and version.
- **AC-07:** When consent is refused, recording remains unavailable and normal care can continue.

## Capture and resilience

- **AC-08:** A doctor can start, pause, resume, and finish one session without losing its context.
- **AC-09:** Recording state and duration remain visible during capture.
- **AC-10:** When connectivity is lost, audio remains locally captured and the UI communicates
  automatic synchronisation after reconnection.
- **AC-11:** Attempting to leave during capture requires an explicit pause-or-float decision.

## Draft and evidence

- **AC-12:** Finishing recording produces visible audio, transcript, structured-record, and
  draft-processing stages.
- **AC-13:** The result is marked AI-generated and unconfirmed.
- **AC-14:** The doctor can edit every summary section, save/autosave it, and see edited provenance.
- **AC-15:** The doctor can search transcript text, open the full transcript, and invoke audio playback.
- **AC-16:** Referenced prior-visit content is disclosed and can be inspected.
- **AC-17:** A recap-derived result is labelled as recap-derived rather than conversation-derived.

## Confirmation and outputs

- **AC-18:** Confirmation remains blocked until the doctor acknowledges clinical review.
- **AC-19:** After confirmation, summary content becomes read-only and the session shows confirmed state.
- **AC-20:** HIS sync and PDF export remain unavailable before confirmation.
- **AC-21:** HIS sync failure preserves the confirmed record and exposes retry.
- **AC-22:** Editing a patient-sharing copy does not alter the confirmed record or HIS content.
- **AC-23:** Zalo recipients require a valid phone number; email recipients require a valid email.
- **AC-24:** Invited doctors are restricted to the same hospital and receive read-only access.

## Traceability

Each criterion above is grounded in a visible state, control, validation, or transition in
`module2.html`. Criteria intentionally avoid backend behaviour, timing guarantees, or policies
that the prototype does not demonstrate.
