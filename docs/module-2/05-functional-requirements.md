# Functional Requirements

## Identity and session context

- **FR-01:** The system shall maintain one current patient and encounter throughout
  a HIS, embedded, full-screen, or QR flow.
- **FR-02:** Standalone session creation shall require a patient before capture.
- **FR-03:** Minimal patient creation shall require name, phone, valid four-digit birth
  year, and address.
- **FR-04:** The session shall display patient, doctor, department/room, and encounter
  identifiers where available.

## Reference context

- **FR-05:** The system shall show prior visits for the selected patient.
- **FR-06:** Relevant prior visits may be automatically linked as reference context.
- **FR-07:** Standalone mode shall accept reference text and PDF, DOCX, TXT, PNG, and
  JPEG files.
- **FR-08:** Reference context shall autosave and remain associated with the current
  patient/session.
- **FR-09:** The UI shall distinguish reference context from recorded conversation and
  from content sent to HIS.

## Capture

- **FR-10:** Recording shall be disabled until valid consent conditions are met.
- **FR-11:** Capture shall support start, pause, resume, and finish in one session.
- **FR-12:** The UI shall continuously show recording/paused state and duration.
- **FR-13:** The doctor may reveal or hide a live transcript preview.
- **FR-14:** Supported browsers may continue capture in a floating window.

## Processing and review

- **FR-15:** Finishing capture shall initiate audio save, transcript generation,
  structured-record generation, and draft completion states.
- **FR-16:** Processing may continue in the background.
- **FR-17:** The generated summary shall begin as an editable, unconfirmed draft.
- **FR-18:** Draft sections shall autosave and mark doctor-edited sections.
- **FR-19:** The doctor shall be able to search transcript evidence and open the full
  transcript/audio view.
- **FR-20:** Confirmation shall require an explicit acknowledgement that patient,
  medication, allergy, and AI-generated content were checked.
- **FR-21:** Confirmation shall make the record read-only.

## Downstream actions

- **FR-22:** HIS sync shall remain disabled before confirmation.
- **FR-23:** Patient sharing shall allow patient-friendly or clinical content through
  Zalo or email, with multiple validated recipients.
- **FR-24:** Editing shared content shall not change the confirmed clinical record.
- **FR-25:** Doctor invitations shall be limited to doctors in the same hospital and
  shall grant read-only access.
- **FR-26:** PDF export shall be available only after confirmation.
