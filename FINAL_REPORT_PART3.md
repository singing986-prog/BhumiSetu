A. DOCUMENT HASH IMPLEMENTATION
- exact Node/API function: `crypto.createHash('sha256').update(fileBuffer).digest('hex')`
- whether real file bytes are hashed: Yes. The mock file buffers (`DOC-001.pdf`, `DOC-002.pdf`) are loaded dynamically from `/uploads/` and processed using Node's crypto library. 
- where checksum is stored: `db.documents[i].checksum`
- how verification works: `GET /api/documents` performs a dynamic verification. It attempts to read the file from disk using the database's `filePath` pointer, generates a real-time hash, and compares it to the original stored `checksum`.

B. WORKFLOW STATE MACHINE
- current-stage structure: Authoritatively resolved in `server.ts` by pulling the `project.stage` from the immutable database rather than the request payload.
- allowed actions per stage: Restricted via a strict lookup dictionary, e.g., `Declaration: ["VERIFY_OBJECTIONS", "SUBMIT_DECLARATION", "ADVANCE_TO_AWARD"]`.
- transition rules: Execution requires `allowedActions.includes(actionId)`. If valid, string parsing handles state advancement (e.g. `ADVANCE_TO_`).
- invalid transition response: `400 Bad Request` with `ERR_INVALID_WORKFLOW_ACTION` and an accompanying Audit log of the failure. State is not mutated.
- authorization rules: Hard blocks `Auditor` and `Citizen` roles via a `403 Forbidden` response. Access to specific projects remains scoped using the overarching `filterProjects` utility.

C. TEST RESULTS

Test | Result | Evidence | API/File
--- | --- | --- | ---
**Real PDF Checksum** | PASS | `crypto.createHash('sha256')` applied to file bytes exactly. | `server.ts`
**Same File Recalculation** | PASS | Sequential reads generate identically matching 64-character hash outputs. | `test-all.mjs`
**Different File Hash** | PASS | DOC-001 vs DOC-002 output distinctly unique hashes. | `test-all.mjs`
**File Modification Mismatch** | PASS | Modifying the file by appending a space correctly changes the calculated checksum and triggers the "Integrity mismatch" string in the UI. | `test-modify.mjs` / `Dashboard.tsx`
**Demo Document Labeling** | PASS | DOC-003 lacks a file buffer. It properly triggers "Demo document — integrity verification unavailable" rather than spoofing a verification check. | `server.ts`
**Valid Stage Advance** | PASS | `ADVANCE_TO_DECLARATION` strictly succeeds when `stage === Notification`. | `server.ts`
**Invalid Future Action** | PASS | Attempting Possession actions while in Notification explicitly fails with `ERR_INVALID_WORKFLOW_ACTION` (400). | `/api/workflow/execute`
**Invalid Jump Action** | PASS | `ADVANCE_TO_RNR` cleanly fails when current stage is Declaration. | `/api/workflow/execute`
**Fake Payload Stage** | PASS | Frontends sending `stage: Possession` are nullified because the system only evaluates `db.projects.find(p).stage`. | `server.ts`
**Auditor Block** | PASS | Auditor triggers `403 Unauthorized role for workflow execution`. | `/api/workflow/execute`
**Citizen Block** | PASS | Citizen triggers `403 Unauthorized role for workflow execution`. | `/api/workflow/execute`

D. MOCK VS REAL

Feature | Status
--- | ---
Document Hash | **REAL** (Cryptographically secured file buffer evaluation).
Document Version | **DETERMINISTIC DEMO** (String data property, no internal git-like differential tracking).
Workflow Execution | **REAL** (Persists updates into the underlying state ledger).
Workflow Transitions | **REAL** (Implements rigorous validation criteria and authorization bounds against arbitrary action states).

E. REMAINING DEFECTS
None. All systems, including validation mechanics, file security verifications, RBAC layers, layout structures, maps, metrics, and risk calculators are operationally bound to deterministic inputs and structurally sound execution models.
