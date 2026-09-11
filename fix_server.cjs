const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Add crypto import
if (!code.includes('import crypto')) {
  code = code.replace('import express', 'import crypto from "crypto";\nimport fs from "fs";\nimport express');
}

// 2. Initialize real files for documents and set their checksums
const initDocsCode = `
// Initialize actual files for documents to demonstrate real SHA-256
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Create a real file for DOC-001
const doc1Path = path.join(uploadsDir, 'DOC-001.pdf');
if (!fs.existsSync(doc1Path)) {
  fs.writeFileSync(doc1Path, 'Real file content for SEC 11 Notification Gazette.\\nThis is an official document.');
}
// Create a real file for DOC-002
const doc2Path = path.join(uploadsDir, 'DOC-002.pdf');
if (!fs.existsSync(doc2Path)) {
  fs.writeFileSync(doc2Path, 'Real file content for SEC 19 Declaration.\\nThis is an official document.');
}

// We leave DOC-003 without a real file to act as a demo document

function getFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}
`;

// Insert the initDocsCode before db definition
if (!code.includes('// Initialize actual files for documents')) {
  code = code.replace('const db = {', initDocsCode + '\nconst db = {');
}

// 3. Modify db.documents to use actual hashes
code = code.replace(
  'checksum: "8a4d2e1c9b3f0a7d6e5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e"',
  'checksum: getFileHash(path.join(process.cwd(), "uploads", "DOC-001.pdf")) || "8a4d2e1c9b3f0a7d6e5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e", filePath: path.join(process.cwd(), "uploads", "DOC-001.pdf")'
);

code = code.replace(
  'checksum: "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e"',
  'checksum: getFileHash(path.join(process.cwd(), "uploads", "DOC-002.pdf")) || "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e", filePath: path.join(process.cwd(), "uploads", "DOC-002.pdf")'
);

// Remove checksum for DOC-003 to make it a demo document without real file
code = code.replace(
  'checksum: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"',
  '/* no checksum */'
);

// 4. Update /api/documents to return verification data
const docEndpoint = `
  app.get("/api/documents", authenticateToken, (req, res) => {
    const projs = filterProjects(req.query, (req as any).user).map(p => p.id);
    let docs = db.documents.filter(d => projs.includes(d.projectId));
    if (req.query.stage) {
      docs = docs.filter(d => d.stage.toLowerCase() === (req.query.stage as string).toLowerCase());
    }
    
    // Perform dynamic verification
    const verifiedDocs = docs.map(d => {
      if (d.filePath && fs.existsSync(d.filePath)) {
        const actualHash = getFileHash(d.filePath);
        return {
          ...d,
          calculatedChecksum: actualHash,
          verificationStatus: actualHash === d.checksum ? "Verified — SHA-256 matches" : "Integrity mismatch — SHA-256 does not match",
          hasRealFile: true
        };
      }
      return { ...d, hasRealFile: false, verificationStatus: "Demo document — integrity verification unavailable" };
    });
    
    res.json(verifiedDocs);
  });
`;

code = code.replace(
  /app\.get\("\/api\/documents"[\s\S]*?res\.json\(docs\);\s*}\);/,
  docEndpoint.trim()
);

fs.writeFileSync('server.ts', code);
console.log("Updated server.ts for documents");
