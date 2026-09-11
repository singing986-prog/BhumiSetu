import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

const oldGetDocs = /app\.get\("\/api\/documents", authenticateToken, \(req, res\) => \{[\s\S]*?res\.json\(verifiedDocs\);\s*\}\);/;

const newDocsApi = `
  // Verify Role/Jurisdiction for Documents
  const checkDocJurisdiction = (doc, user) => {
    if (user.role === "Affected Citizen") {
        return doc.ulpin === user.ulpin || false; 
    }
    if (user.role === "State Nodal Officer" && user.jurisdiction !== "All") {
        const p = (db as any).projects.find(p => p.id === doc.projectId);
        if (p && p.state !== user.jurisdiction) return false;
    }
    if (user.role === "District LAO" && user.jurisdiction !== "All") {
        const p = (db as any).projects.find(p => p.id === doc.projectId);
        if (p && p.district !== user.jurisdiction) return false;
    }
    return true;
  };

  app.get("/api/documents", authenticateToken, (req, res) => {
    const user = (req as any).user;
    const projs = filterProjects(req.query, user).map(p => p.id);
    let docs = (db as any).documents.filter(d => projs.includes(d.projectId));
    
    // Filter by Citizen ULPIN if applicable
    if (user.role === "Affected Citizen" && user.ulpin) {
       docs = docs.filter(d => d.ulpin === user.ulpin);
    }
    
    // Additional Filters
    if (req.query.type && req.query.type !== 'ALL') {
       docs = docs.filter(d => d.type === req.query.type);
    }
    if (req.query.status && req.query.status !== 'ALL') {
       docs = docs.filter(d => d.status === req.query.status);
    }
    if (req.query.q) {
       const q = (req.query.q as string).toLowerCase();
       docs = docs.filter(d => d.id.toLowerCase().includes(q) || d.title.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q));
    }
    
    // Verify jurisdiction over all remaining
    docs = docs.filter(d => checkDocJurisdiction(d, user));
    
    res.json(docs);
  });

  const uploadMiddleware = multer({ 
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  });

  app.post("/api/documents", authenticateToken, uploadMiddleware.single('file'), (req, res) => {
    const user = (req as any).user;
    if (user.role === "Auditor") return res.status(403).json({ error: "Unauthorized to upload" });
    
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    
    const { title, type, projectId, parcelId, ulpin, rnrId, compensationId, workflowId, remarks } = req.body;
    
    if (!projectId || !(db as any).projects.find(p => p.id === projectId)) {
        return res.status(400).json({ error: "Invalid Project ID" });
    }
    
    const docId = "DOC-" + Date.now();
    const fileName = docId + "_" + file.originalname;
    const storagePath = path.join(process.cwd(), "uploads", fileName);
    
    // Write actual bytes
    fs.writeFileSync(storagePath, file.buffer);
    
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
    
    const newDoc = {
        id: docId,
        title: title || file.originalname,
        fileName: file.originalname,
        type: type || "OTHER",
        version: "1.0",
        projectId,
        parcelId,
        ulpin,
        rnrId,
        compensationId,
        workflowId,
        uploadedBy: user.email,
        uploadedByRole: user.role,
        uploadedAt: new Date().toISOString(),
        fileSize: (file.size / 1024).toFixed(1) + " KB",
        mimeType: file.mimetype,
        storagePath,
        checksum,
        checksumAlgorithm: "SHA-256",
        integrityStatus: "VERIFIED",
        signatureStatus: "NOT_SIGNED",
        status: "VERIFIED",
        remarks
    };
    
    (db as any).documents.push(newDoc);
    
    (db as any).auditEvents.push({
       id: "AUD-" + Date.now(), projectId, parcelId,
       action: "DOCUMENT_UPLOADED", stage: "Documents", remarks: \`Uploaded \${newDoc.fileName}\`,
       executedBy: user.email, timestamp: new Date().toISOString()
    });
    
    res.json({ success: true, data: newDoc });
  });

  app.post("/api/documents/:id/version", authenticateToken, uploadMiddleware.single('file'), (req, res) => {
    const user = (req as any).user;
    if (user.role === "Auditor") return res.status(403).json({ error: "Unauthorized to upload" });
    
    const doc = (db as any).documents.find(d => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    if (!checkDocJurisdiction(doc, user)) return res.status(403).json({ error: "Unauthorized access" });
    
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    
    // Archive current to history
    (db as any).documentVersions.push({
        versionId: "VER-" + Date.now(),
        documentId: doc.id,
        version: doc.version,
        fileName: doc.fileName,
        uploadedBy: doc.uploadedBy,
        uploadedByRole: doc.uploadedByRole,
        uploadedAt: doc.uploadedAt,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        storagePath: doc.storagePath,
        checksum: doc.checksum,
        checksumAlgorithm: doc.checksumAlgorithm,
        remarks: doc.remarks
    });
    
    // Update current
    const nextVersion = (parseFloat(doc.version) + 1.0).toFixed(1);
    const fileName = doc.id + "_v" + nextVersion + "_" + file.originalname;
    const storagePath = path.join(process.cwd(), "uploads", fileName);
    
    fs.writeFileSync(storagePath, file.buffer);
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
    
    doc.version = nextVersion;
    doc.fileName = file.originalname;
    doc.uploadedBy = user.email;
    doc.uploadedByRole = user.role;
    doc.uploadedAt = new Date().toISOString();
    doc.fileSize = (file.size / 1024).toFixed(1) + " KB";
    doc.mimeType = file.mimetype;
    doc.storagePath = storagePath;
    doc.checksum = checksum;
    doc.integrityStatus = "VERIFIED";
    doc.remarks = req.body.remarks || "";
    
    (db as any).auditEvents.push({
       id: "AUD-" + Date.now(), projectId: doc.projectId, parcelId: doc.parcelId,
       action: "DOCUMENT_VERSION_CREATED", stage: "Documents", remarks: \`Uploaded version \${nextVersion}\`,
       executedBy: user.email, timestamp: new Date().toISOString()
    });
    
    res.json({ success: true, data: doc });
  });

  app.get("/api/documents/:id/download", authenticateToken, (req, res) => {
    const doc = (db as any).documents.find(d => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (!checkDocJurisdiction(doc, (req as any).user)) return res.status(403).json({ error: "Unauthorized access" });
    
    if (fs.existsSync(doc.storagePath)) {
        (db as any).auditEvents.push({
           id: "AUD-" + Date.now(), projectId: doc.projectId, parcelId: doc.parcelId,
           action: "DOCUMENT_DOWNLOADED", stage: "Documents", remarks: \`Downloaded \${doc.fileName}\`,
           executedBy: (req as any).user.email, timestamp: new Date().toISOString()
        });
        res.download(doc.storagePath, doc.fileName);
    } else {
        res.status(404).json({ error: "File not found on disk" });
    }
  });

  app.get("/api/documents/:id/download/:version", authenticateToken, (req, res) => {
    const docVer = (db as any).documentVersions.find(d => d.documentId === req.params.id && d.version === req.params.version);
    if (!docVer) return res.status(404).json({ error: "Version not found" });
    const doc = (db as any).documents.find(d => d.id === req.params.id);
    if (!checkDocJurisdiction(doc, (req as any).user)) return res.status(403).json({ error: "Unauthorized access" });
    
    if (fs.existsSync(docVer.storagePath)) {
        res.download(docVer.storagePath, docVer.fileName);
    } else {
        res.status(404).json({ error: "File not found on disk" });
    }
  });

  app.post("/api/documents/:id/verify-integrity", authenticateToken, (req, res) => {
    const doc = (db as any).documents.find(d => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (!checkDocJurisdiction(doc, (req as any).user)) return res.status(403).json({ error: "Unauthorized access" });
    
    if (!fs.existsSync(doc.storagePath)) {
        return res.status(404).json({ error: "File missing on disk" });
    }
    
    const fileBuffer = fs.readFileSync(doc.storagePath);
    const actualHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    if (actualHash === doc.checksum) {
        doc.integrityStatus = "VERIFIED";
    } else {
        doc.integrityStatus = "INTEGRITY_MISMATCH";
        (db as any).auditEvents.push({
           id: "AUD-" + Date.now(), projectId: doc.projectId, parcelId: doc.parcelId,
           action: "DOCUMENT_INTEGRITY_FAILED", stage: "Documents", remarks: \`Integrity mismatch for \${doc.fileName}\`,
           executedBy: (req as any).user.email, timestamp: new Date().toISOString()
        });
    }
    
    res.json({ success: true, integrityStatus: doc.integrityStatus, calculatedChecksum: actualHash });
  });

  app.get("/api/documents/:id/versions", authenticateToken, (req, res) => {
    const doc = (db as any).documents.find(d => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (!checkDocJurisdiction(doc, (req as any).user)) return res.status(403).json({ error: "Unauthorized access" });
    
    const versions = (db as any).documentVersions.filter(v => v.documentId === req.params.id);
    res.json(versions);
  });
`;

content = content.replace(oldGetDocs, newDocsApi);

fs.writeFileSync('server.ts', content);
