const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// The replacement script
const newEndpoints = `
  const mockDocuments = [
    { id: "DOC-101", projectId: "PRJ-2026-001", stage: "Notification", title: "Gazette_Sec11_3(A)_Nuh_Signed.pdf", type: "Gazette", version: "v1.0", uploadedBy: "District LAO", uploadDate: "2025-10-12", checksum: "8f4e2a...c91b", status: "Verified", url: "/documents/mock1.pdf" },
    { id: "DOC-102", projectId: "PRJ-2026-001", stage: "Notification", title: "SIA_Report_DelhiMumbai_Draft.pdf", type: "Report", version: "v2.1", uploadedBy: "PIA Rep", uploadDate: "2025-10-25", checksum: "3b91ec...4a22", status: "Verified", url: "/documents/mock2.pdf" },
    { id: "DOC-103", projectId: "PRJ-2026-001", stage: "Notification", title: "Environmental_Clearance.pdf", type: "Clearance", version: "v1.0", uploadedBy: "MoEF", uploadDate: "2025-11-01", checksum: "1c22df...11e3", status: "Verified", url: "/documents/mock3.pdf" },
    { id: "DOC-104", projectId: "PRJ-2026-001", stage: "Notification", title: "Public_Hearing_Minutes.pdf", type: "Report", version: "v1.0", uploadedBy: "District LAO", uploadDate: "2025-11-05", checksum: "7c22df...11e3", status: "Verified", url: "/documents/mock4.pdf" },
    
    { id: "DOC-201", projectId: "PRJ-2026-002", stage: "Declaration", title: "SIA_Report_PuneNashik_Draft.pdf", type: "Report", version: "v2.1", uploadedBy: "PIA Rep", uploadDate: "2025-10-25", checksum: "3b91ec...4a22", status: "Pending Signature", url: "/documents/mock5.pdf" },
    { id: "DOC-202", projectId: "PRJ-2026-002", stage: "Declaration", title: "Sec19_Declaration_Draft.pdf", type: "Legal", version: "v1.0", uploadedBy: "District LAO", uploadDate: "2025-12-15", checksum: "4c22df...11e3", status: "Draft", url: "/documents/mock6.pdf" },
    { id: "DOC-203", projectId: "PRJ-2026-002", stage: "Declaration", title: "Land_Schedule_Pune.xlsx", type: "Data", version: "v3.0", uploadedBy: "Surveyor", uploadDate: "2026-01-02", checksum: "5c22df...11e3", status: "Verified", url: "/documents/mock7.xlsx" },
    { id: "DOC-204", projectId: "PRJ-2026-002", stage: "Declaration", title: "Objection_Hearing_Notes.pdf", type: "Report", version: "v1.0", uploadedBy: "District LAO", uploadDate: "2026-01-04", checksum: "6c22df...11e3", status: "Verified", url: "/documents/mock8.pdf" },
    
    { id: "DOC-301", projectId: "PRJ-2026-003", stage: "Award", title: "Award_Enquiry_Kanchipuram.pdf", type: "Legal", version: "v1.0", uploadedBy: "District LAO", uploadDate: "2025-11-05", checksum: "7c22df...11e3", status: "Verified", url: "/documents/mock9.pdf" },
    { id: "DOC-302", projectId: "PRJ-2026-003", stage: "Award", title: "Valuation_Report_Kanchipuram.pdf", type: "Financial", version: "v1.2", uploadedBy: "Valuer", uploadDate: "2025-11-20", checksum: "8c22df...11e3", status: "Verified", url: "/documents/mock10.pdf" },
    { id: "DOC-303", projectId: "PRJ-2026-003", stage: "Award", title: "Draft_Award_Sec23.pdf", type: "Legal", version: "v2.0", uploadedBy: "District LAO", uploadDate: "2025-12-10", checksum: "9c22df...11e3", status: "Under Review", url: "/documents/mock11.pdf" },
    { id: "DOC-304", projectId: "PRJ-2026-003", stage: "Award", title: "Beneficiary_List_Final.xlsx", type: "Data", version: "v1.0", uploadedBy: "Revenue Officer", uploadDate: "2026-01-05", checksum: "ac22df...11e3", status: "Verified", url: "/documents/mock12.xlsx" },
    
    { id: "DOC-401", projectId: "PRJ-2026-004", stage: "Compensation", title: "Gazette_Notification_Kalyan.pdf", type: "Gazette", version: "v1.0", uploadedBy: "District LAO", uploadDate: "2024-06-12", checksum: "bc22df...11e3", status: "Verified", url: "/documents/mock13.pdf" },
    { id: "DOC-402", projectId: "PRJ-2026-004", stage: "Compensation", title: "Award_Order_Kalyan.pdf", type: "Legal", version: "v1.0", uploadedBy: "Collector", uploadDate: "2024-10-05", checksum: "cc22df...11e3", status: "Verified", url: "/documents/mock14.pdf" },
    { id: "DOC-403", projectId: "PRJ-2026-004", stage: "Compensation", title: "DBT_Disbursement_Log.xlsx", type: "Financial", version: "v5.1", uploadedBy: "Treasury", uploadDate: "2025-01-20", checksum: "dc22df...11e3", status: "Verified", url: "/documents/mock15.xlsx" },
    { id: "DOC-404", projectId: "PRJ-2026-004", stage: "Compensation", title: "Grievance_Redressal_Report.pdf", type: "Report", version: "v1.0", uploadedBy: "District LAO", uploadDate: "2025-02-15", checksum: "ec22df...11e3", status: "Verified", url: "/documents/mock16.pdf" },
    
    { id: "DOC-501", projectId: "PRJ-2026-005", stage: "Possession", title: "Possession_Notice_Okhla.pdf", type: "Legal", version: "v1.0", uploadedBy: "District LAO", uploadDate: "2025-10-10", checksum: "fc22df...11e3", status: "Verified", url: "/documents/mock17.pdf" },
    { id: "DOC-502", projectId: "PRJ-2026-005", stage: "Possession", title: "Court_Stay_Order.pdf", type: "Legal", version: "v1.0", uploadedBy: "Legal Dept", uploadDate: "2025-11-05", checksum: "0c22df...11e3", status: "Verified", url: "/documents/mock18.pdf" },
    { id: "DOC-503", projectId: "PRJ-2026-005", stage: "Possession", title: "Site_Inspection_Photos.zip", type: "Media", version: "v1.0", uploadedBy: "Surveyor", uploadDate: "2025-10-15", checksum: "1d22df...11e3", status: "Verified", url: "/documents/mock19.zip" },
    { id: "DOC-504", projectId: "PRJ-2026-005", stage: "Possession", title: "Encroachment_Assessment.pdf", type: "Report", version: "v1.0", uploadedBy: "Revenue Officer", uploadDate: "2025-10-20", checksum: "2d22df...11e3", status: "Verified", url: "/documents/mock20.pdf" }
  ];

  app.get("/api/compensation", (req, res) => {
    const projs = filterProjects(req.query);
    const validProjIds = projs.map(p => p.id);
    const allComp = [
      { id: "COMP-101", projectId: "PRJ-2026-001", ulpin: "06122344556677", ownerName: "Gram Panchayat, Khedki", marketValue: 8500000, solatium: 8500000, totalAssessed: 17000000, amountDisbursed: 17000000, disbursementDate: "2026-08-15", status: "Disbursed" },
      { id: "COMP-102", projectId: "PRJ-2026-002", ulpin: "27122344556688", ownerName: "Smt. Kavita Patil", marketValue: 4200000, solatium: 4200000, totalAssessed: 8400000, amountDisbursed: 0, disbursementDate: null, status: "Processing DBT" },
      { id: "COMP-103", projectId: "PRJ-2026-003", ulpin: "55443322110099", ownerName: "Abdul Khan", marketValue: 3200000, solatium: 3200000, totalAssessed: 6400000, amountDisbursed: 0, disbursementDate: null, status: "Pending" },
      { id: "COMP-104", projectId: "PRJ-2026-004", ulpin: "27122344556699", ownerName: "Rajesh Kumar", marketValue: 5000000, solatium: 5000000, totalAssessed: 10000000, amountDisbursed: 10000000, disbursementDate: "2025-01-10", status: "Disbursed" }
    ];
    res.json(allComp.filter(c => validProjIds.includes(c.projectId)));
  });

  app.get("/api/rnr", (req, res) => {
    const projs = filterProjects(req.query);
    const validProjIds = projs.map(p => p.id);
    const allRnr = [
      { id: "RNR-001", projectId: "PRJ-2026-001", ulpin: "06122344556677", familyHead: "Ramesh Singh", category: "Agricultural Labourer", displacementStatus: "Displaced", entitlements: { housing: true, employment: true, annuity: false }, overallStatus: "In Progress" },
      { id: "RNR-002", projectId: "PRJ-2026-002", ulpin: "27122344556688", familyHead: "Smt. Kavita Patil", category: "Owner", displacementStatus: "Affected Not Displaced", entitlements: { housing: false, employment: false, annuity: true }, overallStatus: "Settled" },
      { id: "RNR-003", projectId: "PRJ-2026-003", ulpin: "55443322110099", familyHead: "Abdul Khan", category: "Owner", displacementStatus: "Affected Not Displaced", entitlements: { housing: false, employment: false, annuity: true }, overallStatus: "Pending" },
      { id: "RNR-004", projectId: "PRJ-2026-004", ulpin: "27122344556699", familyHead: "Rajesh Kumar", category: "Owner", displacementStatus: "Displaced", entitlements: { housing: true, employment: false, annuity: true }, overallStatus: "Settled" }
    ];
    res.json(allRnr.filter(r => validProjIds.includes(r.projectId)));
  });

  app.get("/api/documents", (req, res) => {
    const projs = filterProjects(req.query);
    const validProjIds = projs.map(p => p.id);
    const { stage } = req.query;
    
    let docs = mockDocuments.filter(d => validProjIds.includes(d.projectId));
    if (stage && stage !== "All Stages") {
       // Filter documents strictly by stage if a specific workflow stage is requested
       docs = docs.filter(d => d.stage.toLowerCase() === stage.toLowerCase());
    }
    res.json(docs);
  });
`;

const regex = /app\.get\("\/api\/compensation", \([\s\S]*?app\.get\("\/api\/awards",/;
content = content.replace(regex, newEndpoints.trim() + '\n\n  app.get("/api/awards",');

fs.writeFileSync('server.ts', content);
