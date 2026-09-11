export interface KPI {
  areaNotified: string;
  areaAcquired: string;
  compensationAssessed: string;
  compensationDisbursed: string;
  familiesAffected: string;
  familiesRnR: string;
}

export interface ParcelProperties {
  id: string;
  ulpin: string;
  status: string;
  owner: string;
  area: number;
}

export interface RiskProfile {
  level: 'High' | 'Medium' | 'Low';
  score: number;
  factors: string[];
}

export interface Proposal {
  id: string;
  projectName: string;
  ministry: string;
  category: string;
  state: string;
  district: string;
  status: 'Draft' | 'Submitted' | 'Under Scrutiny' | 'Approved' | 'Rejected';
  dateSubmitted: string;
  areaRequired: number;
  riskProfile?: RiskProfile;
}

export interface Alert {
  id: string;
  type: 'SLA Breach' | 'Lapse Risk' | 'Approval Pending' | 'Milestone Due';
  message: string;
  projectId: string;
  projectName: string;
  timestamp: string;
  severity: 'Critical' | 'Warning' | 'Info';
  isRead: boolean;
}


export interface CompensationRecord {
  id: string;
  referenceId: string;
  projectId: string;
  parcelId: string;
  ulpin: string;
  beneficiaryId: string;
  beneficiaryName: string;
  state: string;
  district: string;
  village: string;
  area: number;
  marketValue: number;
  solatium: number;
  additionalComponents: { code: string; label: string; amount: number }[];
  totalAssessed: number;
  approvedAmount: number;
  disbursedAmount: number;
  balanceAmount: number;
  assessmentStatus: "DRAFT" | "ASSESSED" | "SUBMITTED" | "APPROVED" | "RETURNED" | "REJECTED";
  paymentStatus: "PENDING" | "PAYMENT_INITIATED" | "PARTIALLY_PAID" | "PAID";
  paymentHistory: { id: string; reference: string; amount: number; date: string; status: string; initiatedBy: string }[];
  awardId?: string;
  paymentReference?: string;
  paymentDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RnRRecord {
  id: string;
  referenceId: string;
  projectId: string;
  parcelId: string;
  ulpin: string;
  familyId: string;
  familyHead: string;
  memberCount: number;
  state: string;
  district: string;
  village: string;
  category: string;

  eligibilityStatus: "NOT_ASSESSED" | "ELIGIBLE" | "INELIGIBLE" | "UNDER_REVIEW";
  entitlementStatus: "PENDING" | "ASSESSED";

  housingStatus: "NOT_APPLICABLE" | "PENDING" | "APPROVED" | "ALLOCATED" | "PROVIDED";
  housingEntitlement: boolean;
  housingAllotment?: string;

  landEntitlement: boolean;
  landAllotment?: string;
  landStatus: "NOT_APPLICABLE" | "PENDING" | "ALLOCATED";

  livelihoodStatus: "NOT_APPLICABLE" | "PENDING" | "IN_PROGRESS" | "COMPLETED";
  livelihoodEntitlement: boolean;
  livelihoodAssistance: number;
  trainingStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED";

  assistanceAssessed: number;
  assistancePaid: number;
  assistanceBalance: number;

  relocationRequired: boolean;
  relocationStatus: "NOT_REQUIRED" | "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  relocationDate?: string;

  verificationStatus: "PENDING" | "VERIFIED" | "RETURNED";
  verifiedBy?: string;
  verifiedAt?: string;

  approvalStatus: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "RETURNED" | "REJECTED" | "IMPLEMENTATION_IN_PROGRESS" | "SETTLED";
  approvedBy?: string;
  approvedAt?: string;
  remarks?: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
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
}

export interface AwardItem {
  id: string; // awardItemId
  awardId: string;
  projectId: string;
  parcelId: string;
  ulpin: string;
  beneficiaryId: string;
  beneficiaryName: string;
  compensationId?: string;
  rnrId?: string;
  eligibleAmount: number;
  awardAmount: number;
  status: string;
  remarks?: string;
}

export interface AwardRecord {
  id: string; // awardId
  referenceId: string;
  projectId: string;
  projectName: string;
  state: string;
  district: string;
  issueDate?: string;
  status: "DRAFT" | "SUBMITTED" | "VERIFIED" | "RETURNED" | "APPROVED" | "REJECTED" | "ISSUED";
  beneficiaryCount: number;
  totalAmount: number;
  awardItems: AwardItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  issuedBy?: string;
  issuedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  remarks?: string;
  rejectionReason?: string;
  documentId?: string;
}

export interface ReportRecord {
  id: string;
  title: string;
  type: string;
  generatedDate: string;
  generatedBy: string;
  format: string;
  size: string;
}

export interface GrievanceRecord {
  id: string;
  trackingId: string;
  category: string;
  description: string;
  submittedBy: string;
  submittedDate: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  assignedTo: string;
  priority: 'High' | 'Medium' | 'Low';
}
