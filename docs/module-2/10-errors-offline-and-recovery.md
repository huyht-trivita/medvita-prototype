# Errors, Offline Operation, and Recovery

## Network interruption during recording

- Recording continues locally on the device.
- The interface clearly states that audio is being kept locally.
- Audio is expected to synchronise automatically when connectivity returns.
- Pause, resume, and finish remain available.

## Exit during recording

The product intercepts exit and offers two explicit choices:

- pause recording and exit; or
- continue in a floating recorder when the browser supports it.

If floating mode is unsupported, the doctor is told to remain in the session or pause.

## Consent failure or refusal

- Recording controls remain disabled until all conditions for the selected method are met.
- Selecting audio consent without consent audio does not unlock capture.
- Refusal records the decision and exposes a normal-care path without recording.
- An optional post-visit doctor recap can create a separately labelled draft.

## Processing

The prototype demonstrates progress states and background processing but does not show
a failed transcript or failed summary state. Production error codes, retry limits, and
manual reprocessing are therefore unspecified.

## HIS failure

- The confirmed record remains valid and stored in MedVita.
- The UI reports that HIS is unreachable.
- A retry action is provided.
- Successful retry updates HIS and records a success time.

## Input validation

- Standalone login requires both credentials.
- Registration requires identity, hospital, department, a password of at least eight
  characters, matching confirmation, and a valid OTP.
- New patient creation validates mandatory fields and birth-year format.
- Sharing validates phone or email according to the selected channel.
- Doctor recap cannot be submitted empty.
