# Product Scope

## Included

- HIS-linked and standalone doctor entry points.
- Doctor authentication and prototype standalone registration with OTP.
- Patient selection and minimal patient creation in standalone mode.
- Binding a session to patient, doctor, department, and encounter context.
- Prior-visit context, free-text context, and reference-file attachment.
- Consent by verbal confirmation, electronic confirmation, or optional consent audio.
- Start, pause, resume, stop, and background/floating recording controls.
- Local recording during network loss and subsequent automatic synchronisation.
- Live transcript preview.
- Post-recording transcript and structured-summary generation.
- Draft editing, autosave, explicit save, and clinical confirmation.
- Transcript search, full transcript view, and audio playback affordances.
- Read-only confirmed records.
- HIS synchronisation, patient sharing, read-only doctor collaboration, and PDF export.
- Worklists for sessions requiring action, completed sessions, and all sessions.
- A doctor recap path when the patient declines recording.

## Excluded or not demonstrated

- Autonomous diagnosis, prescription, treatment decision, or clinical sign-off by AI.
- Patient self-service authentication or direct patient editing.
- Actual microphone, ASR, AI, HIS, Zalo, email, PDF, or identity-provider integration.
- Administrative dashboards, billing, analytics, model training, or dataset labelling.
- Detailed role administration or hospital provisioning.
- Deletion, retention scheduling, legal hold, or data-subject request workflows.
- A complete amendment/versioning interface after confirmation.

## Prototype-only behaviour

Static identities, medical content, timers, delays, authentication values, and success
responses are demonstrations. They define intended states and transitions, not a
production implementation or performance commitment.
