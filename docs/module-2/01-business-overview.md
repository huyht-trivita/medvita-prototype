# Business Overview

## Problem

During an examination, the doctor must focus on the patient while also capturing
the details needed for a clinical record. Manual note-taking interrupts the
conversation, creates duplicate work, and can disconnect the final note from the
source discussion.

## Proposed value

MedVita records the conversation in the background and turns it into a structured
draft. The doctor remains the final clinical authority: AI output cannot become a
confirmed record or be sent to HIS until the doctor reviews and explicitly
confirms it.

The product provides value through:

- less manual documentation during the consultation;
- a searchable transcript and playable audio as review evidence;
- structured, editable clinical summaries;
- continuity through prior-visit and uploaded reference context;
- controlled HIS handoff after confirmation;
- a separate patient-friendly sharing flow;
- resilience when the network is unavailable.

## Product principles

1. **Ambient first:** the doctor should continue the natural consultation without
   entering data during recording.
2. **Patient and encounter first:** every clinical session is attached to a known
   patient and visit context.
3. **Consent before capture:** recording remains unavailable until consent has
   been recorded.
4. **Evidence before trust:** the summary can be checked against transcript and
   audio.
5. **Human confirmation:** AI creates drafts; the doctor creates the final record.
6. **Independent destinations:** HIS sync, patient sharing, internal collaboration,
   and PDF export are separate actions.
7. **Safe degradation:** refusal or network failure must not prevent normal care.

## Success outcomes represented by the prototype

- A doctor can complete the capture-to-confirmation flow without manual note-taking
  during the consultation.
- A clinical claim in the draft can be checked against source evidence.
- No unconfirmed content can be synchronised, exported, or treated as final.
- Recording can continue locally during a temporary network interruption.
- Refusing recording leaves a usable non-recording care path.
