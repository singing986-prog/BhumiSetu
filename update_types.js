import fs from 'fs';
let types = fs.readFileSync('src/types.ts', 'utf-8');

const newCompInterface = `export interface CompensationRecord {
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
}`;

types = types.replace(/export interface CompensationRecord \{[\s\S]*?\}/, newCompInterface);
fs.writeFileSync('src/types.ts', types);
