import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

// Ensure uploads dir
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Generate some fake PDFs
const demoFiles = [
    { id: 'DOC-001', name: 'DOC-001.pdf', content: 'Fake PDF content for Sec 11 Notification.' },
    { id: 'DOC-002', name: 'DOC-002.pdf', content: 'Fake PDF content for Sec 19 Declaration.' },
    { id: 'DOC-003', name: 'DOC-003.pdf', content: 'Fake PDF content for SIA Report.' },
    { id: 'DOC-004', name: 'DOC-004.pdf', content: 'Fake PDF content for Award Document.' },
    { id: 'DOC-005', name: 'DOC-005.pdf', content: 'Fake PDF content for R&R Document.' }
];

const getHash = (content) => crypto.createHash('sha256').update(content).digest('hex');

demoFiles.forEach(f => {
    fs.writeFileSync(path.join('uploads', f.name), f.content);
});

const newDocsArray = `documents: [
      { id: "DOC-001", title: "Sec 11 Notification Gazette", fileName: "DOC-001.pdf", type: "NOTIFICATION", version: "1.0", projectId: "PRJ-2026-001", parcelId: "PAR-001", ulpin: "06122344556677", uploadedBy: "lao.district@bhoomisetu.gov.in", uploadedByRole: "District LAO", uploadedAt: "2025-12-01T10:00:00Z", fileSize: "123 KB", mimeType: "application/pdf", storagePath: path.join(process.cwd(), "uploads", "DOC-001.pdf"), checksum: "${getHash(demoFiles[0].content)}", checksumAlgorithm: "SHA-256", integrityStatus: "VERIFIED", signatureStatus: "SIGNED", status: "VERIFIED" },
      { id: "DOC-002", title: "Sec 19 Declaration", fileName: "DOC-002.pdf", type: "DECLARATION", version: "1.0", projectId: "PRJ-2026-001", parcelId: "PAR-002", ulpin: "06122344556678", uploadedBy: "sno@bhoomisetu.gov.in", uploadedByRole: "State Nodal Officer", uploadedAt: "2026-01-20T11:00:00Z", fileSize: "150 KB", mimeType: "application/pdf", storagePath: path.join(process.cwd(), "uploads", "DOC-002.pdf"), checksum: "${getHash(demoFiles[1].content)}", checksumAlgorithm: "SHA-256", integrityStatus: "VERIFIED", signatureStatus: "PENDING_SIGNATURE", status: "PENDING_REVIEW" },
      { id: "DOC-003", title: "SIA Report", fileName: "DOC-003.pdf", type: "REPORT", version: "1.0", projectId: "PRJ-2026-002", parcelId: "PAR-003", ulpin: "27122344556677", uploadedBy: "admin@bhoomisetu.gov.in", uploadedByRole: "Super Admin", uploadedAt: "2026-02-15T09:00:00Z", fileSize: "2 MB", mimeType: "application/pdf", storagePath: path.join(process.cwd(), "uploads", "DOC-003.pdf"), checksum: "${getHash(demoFiles[2].content)}", checksumAlgorithm: "SHA-256", integrityStatus: "VERIFIED", signatureStatus: "NOT_SIGNED", status: "VERIFIED" },
      { id: "DOC-004", title: "Sec 23 Award Document", fileName: "DOC-004.pdf", type: "AWARD", version: "1.0", projectId: "PRJ-2026-002", parcelId: "PAR-003", ulpin: "27122344556677", uploadedBy: "lao.district@bhoomisetu.gov.in", uploadedByRole: "District LAO", uploadedAt: "2026-05-15T14:00:00Z", fileSize: "1.1 MB", mimeType: "application/pdf", storagePath: path.join(process.cwd(), "uploads", "DOC-004.pdf"), checksum: "${getHash(demoFiles[3].content)}", checksumAlgorithm: "SHA-256", integrityStatus: "VERIFIED", signatureStatus: "SIGNED", status: "VERIFIED" },
      { id: "DOC-005", title: "R&R Entitlement Verification", fileName: "DOC-005.pdf", type: "R&R", version: "1.0", projectId: "PRJ-2026-001", rnrId: "RNR-001", uploadedBy: "sno@bhoomisetu.gov.in", uploadedByRole: "State Nodal Officer", uploadedAt: "2026-06-01T10:30:00Z", fileSize: "800 KB", mimeType: "application/pdf", storagePath: path.join(process.cwd(), "uploads", "DOC-005.pdf"), checksum: "${getHash(demoFiles[4].content)}", checksumAlgorithm: "SHA-256", integrityStatus: "VERIFIED", signatureStatus: "NOT_SIGNED", status: "VERIFIED" }
    ],
    documentVersions: [],`;

let serverTs = fs.readFileSync('server.ts', 'utf-8');
const oldDocsMatch = /documents: \[\s*\{ id: "DOC-001"[\s\S]*?\],\s*awards:/;

serverTs = serverTs.replace(oldDocsMatch, newDocsArray + '\n    awards:');
fs.writeFileSync('server.ts', serverTs);
