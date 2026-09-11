import fs from 'fs';

let types = fs.readFileSync('src/types.ts', 'utf-8');

const oldRnRRecord = `export interface RnRRecord {
  id: string;
  projectId: string;
  parcelId: string;
  familyHead: string;
  members: number;
  category: string;
  housingStatus: string;
  livelihoodStatus: string;
  allowancePaid: number;
  status: string;
}`;

const newRnRRecord = `export interface RnRRecord {
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
}`;

types = types.replace(oldRnRRecord, newRnRRecord);
fs.writeFileSync('src/types.ts', types);
