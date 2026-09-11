import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf-8');

const oldDocRecord = `export interface DocumentRecord {
  id: string;
  title: string;
  type: string;
  version: string;
  uploadedBy: string;
  uploadDate: string;
  checksum: string;
  status: 'Verified' | 'Pending Signature';
}`;

const newDocRecord = `export interface DocumentRecord {
  id: string;
  title: string;
  fileName: string;
  type: string;
  version: string;
  
  projectId: string;
  parcelId?: string;
  ulpin?: string;
  rnrId?: string;
  compensationId?: string;
  workflowId?: string;

  uploadedBy: string;
  uploadedByRole: string;
  uploadedAt: string;

  fileSize: string;
  mimeType: string;
  storagePath: string;

  checksum: string;
  checksumAlgorithm: string;

  integrityStatus: "NOT_VERIFIED" | "VERIFIED" | "INTEGRITY_MISMATCH";
  signatureStatus: "NOT_SIGNED" | "PENDING_SIGNATURE" | "SIGNED" | "SIGNATURE_INVALID";
  status: "DRAFT" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED" | "ARCHIVED";
  
  remarks?: string;
}

export interface DocumentVersion {
  versionId: string;
  documentId: string;
  version: string;
  fileName: string;
  uploadedBy: string;
  uploadedByRole: string;
  uploadedAt: string;
  fileSize: string;
  mimeType: string;
  storagePath: string;
  checksum: string;
  checksumAlgorithm: string;
  remarks?: string;
}`;

content = content.replace(oldDocRecord, newDocRecord);
fs.writeFileSync('src/types.ts', content);
