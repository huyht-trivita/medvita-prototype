# Consent, Privacy, and Audit

## Consent record

Before capture, the doctor selects:

- the consenting party: patient or legal representative;
- the consent method: verbal, electronic, or recorded audio;
- confirmation that the explanation and consent process occurred.

The prototype records an audit statement containing consent method, consenting party,
doctor, timestamp, and consent-text version. If audio consent is selected, the doctor
must record separate consent evidence before capture becomes available. That evidence
can be replayed, replaced, or deleted before starting.

## Patient information statement

The patient or representative is informed that:

- the conversation is recorded to create a transcript and summary;
- the information is protected under hospital policy;
- AI output does not replace the doctor's professional conclusion;
- access is limited to authorised people;
- consent can be refused or recording can be stopped without affecting care.

## Access boundaries

- Confirmed sessions may be opened read-only.
- Invited doctors receive read-only access and must belong to the same hospital.
- Patient communications are generated from confirmed content but are independent copies.
- Reference context remains attached to the correct patient/session.

## Required audit events inferred directly from visible states

The system must preserve evidence of consent capture, recording start/pause/resume/finish,
draft edits and autosave, clinical confirmation, confirming doctor and time, share action,
HIS sync attempts/outcome, and retry outcome.

## Unspecified policy

The prototype does not define retention periods, encryption standards, key management,
data residency, deletion, revocation after processing, or audit-log administration.
These must not be treated as decided requirements in this version.
