# HIS Integration and Sharing

## HIS entry and continuity

HIS presents three launch choices: embedded panel, full MedVita workspace, and QR/mobile.
All three preserve the same patient and encounter. The embedded panel is the recommended
default because capture can occur without leaving the clinical record.

## HIS handoff

The visible journey is:

```text
HIS context → capture → doctor confirmation → HIS updated
```

HIS sync is disabled until confirmation. During sync, the system displays progress.
On success, HIS shows the confirmed MedVita note and updated status. On failure, the
confirmed record remains safely stored and the doctor can retry.

## Patient sharing

After confirmation, the doctor may choose:

- a patient-friendly visit summary; or
- the clinical visit summary.

The outgoing copy can be edited without changing the confirmed record. Supported
channels in the prototype are Zalo and email. Recipient format is validated, and
multiple recipients can be added.

## Internal collaboration

The doctor may invite another doctor from the same hospital with read-only access.
This collaboration action is independent of patient sharing and HIS sync.

## PDF

The confirmed summary may be printed/exported as PDF. Draft export is blocked.
