import fs from 'fs';

let serverContent = fs.readFileSync('server.ts', 'utf-8');

const oldRnr = /rnr: \[\s*\{ id: "RNR-001"[\s\S]*?\],\s*documents:/;

const newRnr = `rnr: [
      { 
        id: "RNR-001", referenceId: "RNR-REF-1001", projectId: "PRJ-2026-001", parcelId: "PAR-001", ulpin: "06122344556677", familyId: "FAM-001", 
        familyHead: "Rajesh Kumar", memberCount: 4, state: "Haryana", district: "Nuh", village: "Nuh", category: "Displaced",
        eligibilityStatus: "ELIGIBLE", entitlementStatus: "ASSESSED",
        housingStatus: "PROVIDED", housingEntitlement: true, housingAllotment: "HSG-A-01",
        landEntitlement: false, landStatus: "NOT_APPLICABLE",
        livelihoodStatus: "COMPLETED", livelihoodEntitlement: true, livelihoodAssistance: 50000, trainingStatus: "COMPLETED",
        assistanceAssessed: 150000, assistancePaid: 150000, assistanceBalance: 0,
        relocationRequired: true, relocationStatus: "COMPLETED", relocationDate: "2026-01-15",
        verificationStatus: "VERIFIED", verifiedBy: "field_officer", verifiedAt: "2025-11-01",
        approvalStatus: "SETTLED", approvedBy: "lao_nuh", approvedAt: "2026-02-01", remarks: "All entitlements provided.",
        createdBy: "system", createdAt: "2025-10-01", updatedAt: "2026-02-01"
      },
      { 
        id: "RNR-002", referenceId: "RNR-REF-1002", projectId: "PRJ-2026-001", parcelId: "PAR-001", ulpin: "06122344556677", familyId: "FAM-002", 
        familyHead: "Mukesh Kumar", memberCount: 2, state: "Haryana", district: "Nuh", village: "Nuh", category: "Affected Not Displaced",
        eligibilityStatus: "NOT_ASSESSED", entitlementStatus: "PENDING",
        housingStatus: "PENDING", housingEntitlement: false,
        landEntitlement: false, landStatus: "PENDING",
        livelihoodStatus: "PENDING", livelihoodEntitlement: false, livelihoodAssistance: 0, trainingStatus: "PENDING",
        assistanceAssessed: 0, assistancePaid: 0, assistanceBalance: 0,
        relocationRequired: false, relocationStatus: "NOT_REQUIRED",
        verificationStatus: "PENDING",
        approvalStatus: "DRAFT", createdBy: "system", createdAt: "2026-08-01", updatedAt: "2026-08-01"
      },
      { 
        id: "RNR-003", referenceId: "RNR-REF-1003", projectId: "PRJ-2026-001", parcelId: "PAR-002", ulpin: "06122344556678", familyId: "FAM-003", 
        familyHead: "Sunita Devi", memberCount: 5, state: "Haryana", district: "Nuh", village: "Nuh", category: "Displaced",
        eligibilityStatus: "UNDER_REVIEW", entitlementStatus: "PENDING",
        housingStatus: "PENDING", housingEntitlement: false,
        landEntitlement: false, landStatus: "PENDING",
        livelihoodStatus: "PENDING", livelihoodEntitlement: false, livelihoodAssistance: 0, trainingStatus: "PENDING",
        assistanceAssessed: 0, assistancePaid: 0, assistanceBalance: 0,
        relocationRequired: true, relocationStatus: "PLANNED",
        verificationStatus: "VERIFIED", verifiedBy: "field_officer", verifiedAt: "2026-08-10",
        approvalStatus: "UNDER_REVIEW", createdBy: "system", createdAt: "2026-07-15", updatedAt: "2026-08-10"
      },
      { 
        id: "RNR-004", referenceId: "RNR-REF-1004", projectId: "PRJ-2026-002", parcelId: "PAR-003", ulpin: "27122344556677", familyId: "FAM-004", 
        familyHead: "Amit Patel", memberCount: 3, state: "Maharashtra", district: "Pune", village: "Khed", category: "Displaced",
        eligibilityStatus: "ELIGIBLE", entitlementStatus: "ASSESSED",
        housingStatus: "APPROVED", housingEntitlement: true,
        landEntitlement: true, landStatus: "ALLOCATED", landAllotment: "LND-A-01",
        livelihoodStatus: "IN_PROGRESS", livelihoodEntitlement: true, livelihoodAssistance: 25000, trainingStatus: "IN_PROGRESS",
        assistanceAssessed: 100000, assistancePaid: 50000, assistanceBalance: 50000,
        relocationRequired: true, relocationStatus: "IN_PROGRESS",
        verificationStatus: "VERIFIED", verifiedBy: "field_officer_mh", verifiedAt: "2026-06-01",
        approvalStatus: "IMPLEMENTATION_IN_PROGRESS", approvedBy: "lao_pune", approvedAt: "2026-06-15",
        createdBy: "system", createdAt: "2026-05-01", updatedAt: "2026-08-01"
      },
      { 
        id: "RNR-005", referenceId: "RNR-REF-1005", projectId: "PRJ-2026-002", parcelId: "PAR-005", ulpin: "27122344556678", familyId: "FAM-005", 
        familyHead: "Suresh Patel", memberCount: 4, state: "Maharashtra", district: "Pune", village: "Khed", category: "Displaced",
        eligibilityStatus: "INELIGIBLE", entitlementStatus: "PENDING",
        housingStatus: "PENDING", housingEntitlement: false,
        landEntitlement: false, landStatus: "PENDING",
        livelihoodStatus: "PENDING", livelihoodEntitlement: false, livelihoodAssistance: 0, trainingStatus: "PENDING",
        assistanceAssessed: 0, assistancePaid: 0, assistanceBalance: 0,
        relocationRequired: false, relocationStatus: "NOT_REQUIRED",
        verificationStatus: "RETURNED", verifiedBy: "field_officer_mh", verifiedAt: "2026-08-05",
        approvalStatus: "RETURNED", remarks: "Need more proof of residence.",
        createdBy: "system", createdAt: "2026-07-20", updatedAt: "2026-08-05"
      }
    ],
    documents:`;

serverContent = serverContent.replace(oldRnr, newRnr);

fs.writeFileSync('server.ts', serverContent);
