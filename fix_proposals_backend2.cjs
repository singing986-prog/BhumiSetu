const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// The original fix has a bug where `authenticateToken` might be returning 403 because we used SNO login without valid token or something, but actually the login should work. Let's see the login output
// Let's modify the document route to handle uploads.

const docUploadLogic = `
  const multer = require('multer');
  const upload = multer({ 
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  });

  app.post("/api/proposals/:id/documents", authenticateToken, upload.single('file'), (req, res) => {
    const user = (req as any).user;
    if (user.role === "Auditor" || user.role === "Affected Citizen") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const proposal = db.projects.find(p => p.id === req.params.id);
    if (!proposal) return res.status(404).json({ error: "Not found" });
    
    if (!authorizeProposalAccess(user, proposal)) return res.status(403).json({ error: "Unauthorized for this proposal" });
    
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png'];
    if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Invalid file type" });
    }

    const hash = crypto.createHash('sha256');
    hash.update(req.file.buffer);
    const checksum = hash.digest('hex');

    const documentId = "DOC-" + Date.now();
    const version = 1;

    const newDoc = {
        documentId,
        proposalId: proposal.id,
        projectId: proposal.projectId || proposal.id,
        documentType: req.body.documentType || 'Proposal Attachment',
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        version,
        uploadedBy: user.username,
        uploadedAt: new Date().toISOString(),
        checksum,
        checksumAlgorithm: 'SHA-256',
        status: 'Active',
        buffer: req.file.buffer // In-memory storage for demo
    };

    db.documents = db.documents || [];
    db.documents.push(newDoc);

    const auditEvent = {
        id: "AUD-" + Date.now(),
        projectId: proposal.id,
        action: "DOCUMENT_UPLOADED",
        stage: proposal.stage,
        remarks: \`Uploaded \${req.file.originalname}\`,
        executedBy: user.username,
        timestamp: new Date().toISOString()
    };
    db.auditEvents.push(auditEvent);

    res.json({ success: true, document: { ...newDoc, buffer: undefined }, auditEvent });
  });
`;

code = code.replace(
  /app\.post\("\/api\/proposals\/:id\/workflow", authenticateToken, \(req, res\) => \{/,
  docUploadLogic + '\n  app.post("/api/proposals/:id/workflow", authenticateToken, (req, res) => {'
);

fs.writeFileSync('server.ts', code);
console.log("Added document upload route");
