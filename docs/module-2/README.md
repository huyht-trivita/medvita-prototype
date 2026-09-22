# MedVita Module 2 — Product Documentation

This documentation describes the final business behaviour represented by
[`module2.html`](../../module2.html). The prototype is the sole source of truth for
this version. External planning systems, implementation assumptions, and future
roadmap items are intentionally excluded.

## Product statement

MedVita Module 2 is an ambient clinical documentation assistant. It captures a
doctor–patient conversation with recorded consent, produces a structured draft
with transcript evidence, requires the doctor to review and confirm the record,
and only then permits downstream use such as HIS synchronisation, patient
sharing, collaboration, or PDF export.

## Document map

1. [Business overview](01-business-overview.md)
2. [Product scope](02-product-scope.md)
3. [Users and operating modes](03-users-and-operating-modes.md)
4. [End-to-end workflows](04-end-to-end-workflows.md)
5. [Functional requirements](05-functional-requirements.md)
6. [Business rules](06-business-rules.md)
7. [Consent, privacy, and audit](07-consent-privacy-and-audit.md)
8. [Transcript, summary, and evidence](08-transcript-summary-and-evidence.md)
9. [HIS integration and sharing](09-his-integration-and-sharing.md)
10. [Errors, offline operation, and recovery](10-errors-offline-and-recovery.md)
11. [Acceptance criteria](11-acceptance-criteria.md)

## Terminology

- **Encounter:** one clinical visit associated with one patient.
- **Session:** one MedVita recording and documentation workflow within an encounter.
- **Context:** reference material attached to the current patient/session.
- **Draft:** AI-generated or doctor-edited content not yet clinically confirmed.
- **Confirmed record:** immutable clinical content after explicit doctor confirmation.
- **Patient summary:** editable communication derived from the confirmed record.
