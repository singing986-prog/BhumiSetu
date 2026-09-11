A. Is real polygon geometry being saved?
Yes, the geometry sent in the POST request to `/api/parcels` is saved inside the backend's in-memory array (`db.parcels`) and is retrieved correctly when `GET /api/parcels` is called.

B. Is SHA-256 actually calculated from file bytes?
No, it is a DETERMINISTIC DEMO. The application stores a hardcoded 64-character SHA-256 string for each document in the `checksum` field of `db.documents`. It does not calculate the hash from actual uploaded file bytes.

C. Does the workflow enforce valid state transitions?
No, the state machine merely checks if the project stage is in the `stagesList` array and advances to the next index (`cIdx + 1`). It does not validate if the requested action matches the current stage (e.g., trying an action for "Possession" while currently in "Notification" successfully advances the stage regardless of the intended action validation). It does enforce Role-Based Access Control (RBAC) (e.g., returning 403 for `Auditor` or `Citizen`), but the state transition logic itself is not rigorously validated.

TEST SUMMARY:
1. REAL PARCEL GEOMETRY
PASS
Evidence: Map coordinates drawn in frontend (e.g., Polygon `[[[77.017,28.124],...]]`) sent to backend and stored under `geometry`, retrievable correctly.
Actual Geometry: `{"type":"Polygon","coordinates":[[[77.017,28.124],[77.019,28.124],[77.019,28.126],[77.017,28.126],[77.017,28.124]]]}`
Actual projectId: PRJ-2026-001
Actual ULPIN: Demo-ULPIN-100003
Actual Saved Record: {"parcelId":"PAR-004","projectId":"PRJ-2026-001","ulpin":"Demo-ULPIN-100003",...}

2. REAL DOCUMENT SHA-256
PARTIAL
Evidence: The `checksum` property is read directly from `db.documents` in `server.ts` rather than being generated dynamically from a file's byte array using crypto tools.

3. WORKFLOW STATE-MACHINE SECURITY
FAIL
Evidence: `POST /api/workflow/execute` explicitly contains a comment `// In a real application, we would check if the action is valid for the stage` and indiscriminately performs `project.stage = stagesList[cIdx + 1]`. Test B demonstrates that passing stage="Possession" while current stage="Notification" improperly advances the stage without validation rejection. (RBAC tests for Auditor/Citizen PASS with 403 Forbidden).
