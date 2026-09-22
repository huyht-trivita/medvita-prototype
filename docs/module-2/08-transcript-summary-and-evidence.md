# Transcript, Summary, and Evidence

## Processing outputs

After capture, MedVita visibly progresses through:

1. audio saved;
2. transcript created;
3. structured record created;
4. draft completed.

The transcript distinguishes doctor and patient utterances and associates them with
timestamps. The doctor can search the transcript, inspect the full transcript, and
play supporting audio.

## Structured summary

The demonstrated document template contains:

- reason for visit;
- history of present illness;
- recorded symptoms;
- medications and allergies.

Each section is editable before confirmation. An edited section changes provenance
from “AI generated” to “Doctor edited”. Autosave status is shown with a time, and the
doctor may also save the draft explicitly.

## Evidence model

The product distinguishes three sources:

- recorded conversation, represented by transcript and audio;
- prior-visit or uploaded reference context;
- doctor recap entered when recording is refused.

The UI must disclose when a prior department/visit contributed to generated content
and allow the doctor to view the referenced sentence. A recap-generated draft must be
explicitly labelled as coming from the doctor's recap rather than recorded dialogue.

## Confirmation

Before confirmation, the doctor acknowledges review of the patient, medication,
allergy, and AI-generated content. Confirmation changes the draft to a read-only record.
The prototype states that later changes require an amendment, but does not demonstrate
the amendment workflow.
