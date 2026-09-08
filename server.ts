import express from "express";
import path from "path";
import { WebSocketServer } from "ws";
import { createServer as createViteServer } from "vite";
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock API Routes for BhoomiSetu

  let mockProposals = [
    {
      id: "PRJ-2026-001", projectName: "Delhi-Mumbai Expressway (Phase 4)", ministry: "MoRTH", category: "Highway", state: "Haryana", district: "Nuh",
      status: "Approved", dateSubmitted: "2025-11-12", areaRequired: 450.5, areaNotified: 450.5, areaAcquired: 180.2, compensationAssessed: 675.7, compensationPaid: 360.4, familiesAffected: 900, rrSettled: 540, stage: "Notification", riskProfile: { level: "Low", score: 12, factors: ["Favorable historical state timeline", "Low objection count (12)"] }
    },
    {
      id: "PRJ-2026-002", projectName: "Pune-Nashik Semi High-Speed Rail", ministry: "Ministry of Railways", category: "Rail", state: "Maharashtra", district: "Pune",
      status: "Under Scrutiny", dateSubmitted: "2026-01-05", areaRequired: 120.0, areaNotified: 120.0, areaAcquired: 48.0, compensationAssessed: 180.0, compensationPaid: 96.0, familiesAffected: 240, rrSettled: 144, stage: "Declaration", riskProfile: { level: "High", score: 84, factors: ["High historical district delay rate (68%)", "Urban density delays", "High objection volume (450+)"] }
    },
    {
      id: "PRJ-2026-003", projectName: "Chennai-Bengaluru Industrial Corridor (Node 2)", ministry: "DPIIT", category: "Industrial Corridor", state: "Tamil Nadu", district: "Kanchipuram",
      status: "Under Scrutiny", dateSubmitted: "2025-08-20", areaRequired: 315.2, areaNotified: 315.2, areaAcquired: 126.1, compensationAssessed: 472.8, compensationPaid: 252.1, familiesAffected: 630, rrSettled: 378, stage: "Award", riskProfile: { level: "Medium", score: 45, factors: ["Approaching Sec 19 Declaration SLA", "Moderate objection count (142)"] }
    },
    {
      id: "PRJ-2026-004", projectName: "Kalyan Tollway Expansion", ministry: "MoRTH", category: "Highway", state: "Maharashtra", district: "Thane",
      status: "Approved", dateSubmitted: "2024-05-10", areaRequired: 80.0, areaNotified: 80.0, areaAcquired: 32.0, compensationAssessed: 120.0, compensationPaid: 64.0, familiesAffected: 160, rrSettled: 96, stage: "Compensation", riskProfile: { level: "Low", score: 20, factors: ["Funds disbursed", "Minimal objections"] }
    },
    {
      id: "PRJ-2026-005", projectName: "Okhla Underpass", ministry: "MoUD", category: "Urban Development", state: "Delhi", district: "South Delhi",
      status: "Delayed", dateSubmitted: "2025-10-01", areaRequired: 15.0, areaNotified: 15.0, areaAcquired: 6.0, compensationAssessed: 22.5, compensationPaid: 12.0, familiesAffected: 30, rrSettled: 18, stage: "Possession", riskProfile: { level: "High", score: 90, factors: ["Urban encroachment", "Court stay on possession"] }
    }
  ];

  app.get("/api/locations", (req, res) => {
    // Generate state/district hierarchy from projects
    const states = {};
    states["All States"] = ["All Districts"];
    mockProposals.forEach(p => {
      if (!states[p.state]) states[p.state] = ["All Districts"];
      if (!states[p.state].includes(p.district)) states[p.state].push(p.district);
    });
    // Add some fallbacks just in case
    if (!states["Delhi"]) states["Delhi"] = ["All Districts", "New Delhi", "South Delhi"];
    if (!states["Haryana"]) states["Haryana"] = ["All Districts", "Nuh", "Gurugram"];
    res.json(states);
  });

  
  function filterProjects(query) {
    const { state, district, project, stage, category, risk } = query;
    let projs = mockProposals;
    if (state && state !== "All States") projs = projs.filter(p => p.state === state);
    if (district && district !== "All Districts") projs = projs.filter(p => p.district === district);
    if (project && project !== "All Projects") {
       // project could be the ID or name
       projs = projs.filter(p => p.id === project || p.projectName === project);
    }
    if (stage && stage !== "All Stages") projs = projs.filter(p => p.stage === stage);
    if (category && category !== "All Categories") projs = projs.filter(p => p.category === category);
    if (risk && risk !== "All Risks") projs = projs.filter(p => p.riskProfile.level === risk);
    return projs;
  }

  
  let userProfile = { name: "Ramesh Kumar", email: "ramesh.k@bhoomisetu.gov.in", role: "District LAO", district: "New Delhi", notifEmail: true, notifSms: true };
  let currentPasswordHash = "dummyhash";

  app.get("/api/profile", (req, res) => {
    res.json(userProfile);
  });

  app.post("/api/profile", (req, res) => {
    const { name, email, notifEmail, notifSms } = req.body;
    if (name) userProfile.name = name;
    if (email) userProfile.email = email;
    if (notifEmail !== undefined) userProfile.notifEmail = notifEmail;
    if (notifSms !== undefined) userProfile.notifSms = notifSms;
    res.json(userProfile);
  });

  app.post("/api/password", (req, res) => {
    const { current, newPass } = req.body;
    // In a real app, verify hash. Here we just mock verify.
    if (!current || !newPass) return res.status(400).json({ error: "Missing fields" });
    if (current === newPass) return res.status(400).json({ error: "New password must be different" });
    if (newPass.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
    // Mocking that any current password except "wrong" works for demo purposes, since we don't have login session yet
    if (current === "wrong") return res.status(401).json({ error: "Incorrect current password" });
    
    currentPasswordHash = newPass; // mock update
    res.json({ success: true });
  });

  
  let mockNotifications = [
    { id: 1, title: "Section 24(2) Lapse Risk", msg: "Award is 4.8 years old with pending possession for CBIC Node 2.", time: "2 mins ago", loc: "Kanchipuram", read: false, severity: "high" },
    { id: 2, title: "Declaration Deadline", msg: "Section 19 Declaration pending for 14 parcels.", time: "1 hour ago", loc: "Rohtak", read: false, severity: "medium" },
    { id: 3, title: "Fund Disbursement", msg: "₹14.2 Cr disbursed to 45 beneficiaries.", time: "3 hours ago", loc: "Pune", read: true, severity: "low" }
  ];

  app.get("/api/notifications", (req, res) => {
    res.json(mockNotifications);
  });

  app.post("/api/notifications/read", (req, res) => {
    mockNotifications = mockNotifications.map(n => ({...n, read: true}));
    res.json(mockNotifications);
  });

  app.get("/api/projects", (req, res) => {
    const projs = filterProjects(req.query);
    res.json(projs.map(p => ({ id: p.id, name: p.projectName })));
  });

  app.get("/api/proposals", (req, res) => {
    res.json(filterProjects(req.query));
  });

  app.post("/api/proposals", (req, res) => {
    const newProposal = {
      ...req.body,
      id: `PRJ-2026-00${mockProposals.length + 1}`,
      status: "Submitted",
      dateSubmitted: new Date().toISOString().split('T')[0],
      riskProfile: {
        level: "Medium",
        score: 50,
        factors: ["Insufficient historical data for accurate prediction", "Standard SLA applies"]
      }
    };
    mockProposals.unshift(newProposal);
    res.json(newProposal);
  });

  app.get("/api/search", (req, res) => {
    const q = req.query.q ? String(req.query.q).toLowerCase() : "";
    if (!q) return res.json([]);
    
    const results = [];
    
    // search projects
    mockProposals.forEach(p => {
      if (p.projectName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.district.toLowerCase().includes(q)) {
        results.push({ type: "Project", id: p.id, name: p.projectName, detail: p.state + " • " + p.district });
      }
    });

    // We do not have full parcels mock array outside, but we can return some ULPINs
    const mockUlpins = [
      { ulpin: "06122344556677", project: "Delhi-Mumbai Expressway (Phase 4)", name: "Gram Panchayat, Khedki", detail: "Haryana • Nuh" },
      { ulpin: "06122344556678", project: "Delhi-Mumbai Expressway (Phase 4)", name: "Commercial Plot", detail: "Haryana • Nuh" },
      { ulpin: "27122344556677", project: "Pune-Nashik Semi High-Speed Rail", name: "Smt. Kavita Patil", detail: "Maharashtra • Pune" }
    ];
    
    mockUlpins.forEach(u => {
       if (u.ulpin.includes(q) || u.name.toLowerCase().includes(q)) {
          results.push({ type: "Parcel", id: u.ulpin, name: u.name, detail: u.detail });
       }
    });
    
    res.json(results);
  });
  app.get("/api/alerts", (req, res) => {
    const state = req.query.state || "All States";
    const alerts = [
      { id: "ALT-001", type: "Lapse Risk", message: "Section 24(2) lapse risk: Award is 4.8 years old with pending possession for CBIC Node 2.", projectId: "PRJ-2026-003", projectName: "CBIC Node 2", timestamp: "2026-09-08T10:30:00Z", severity: "Critical", isRead: false },
      { id: "ALT-002", type: "SLA Breach", message: "Sec 19 Declaration delayed by 45 days beyond SIA clearance.", projectId: "PRJ-2026-002", projectName: "Pune-Nashik Semi High-Speed Rail", timestamp: "2026-09-08T08:15:00Z", severity: "Warning", isRead: false },
      { id: "ALT-003", type: "Approval Pending", message: "District LAO submitted compensation award for Nuh Expressway Phase.", projectId: "PRJ-2026-001", projectName: "Delhi-Mumbai Expressway", timestamp: "2026-09-07T16:45:00Z", severity: "Info", isRead: true },
    ];
    if (state === "Delhi") {
      res.json([{ id: "ALT-DEL-1", type: "SLA Breach", message: "Urban encroachment causing delay in Okhla Underpass.", projectId: "PRJ-2026-009", projectName: "Okhla Underpass", timestamp: "2026-09-08T11:00:00Z", severity: "Critical", isRead: false }]);
    } else {
      res.json(alerts);
    }
    return;
    res.json([
      { id: "ALT-001", type: "Lapse Risk", message: "Section 24(2) lapse risk: Award is 4.8 years old with pending possession for CBIC Node 2.", projectId: "PRJ-2026-003", projectName: "CBIC Node 2", timestamp: "2026-09-08T10:30:00Z", severity: "Critical", isRead: false },
      { id: "ALT-002", type: "SLA Breach", message: "Sec 19 Declaration delayed by 45 days beyond SIA clearance.", projectId: "PRJ-2026-002", projectName: "Pune-Nashik Semi High-Speed Rail", timestamp: "2026-09-08T08:15:00Z", severity: "Warning", isRead: false },
      { id: "ALT-003", type: "Approval Pending", message: "District LAO submitted compensation award for Nuh Expressway Phase.", projectId: "PRJ-2026-001", projectName: "Delhi-Mumbai Expressway", timestamp: "2026-09-07T16:45:00Z", severity: "Info", isRead: true },
    ]);
  });


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

  app.get("/api/awards", (req, res) => {
      const state = req.query.state || "All States";
      const isDelhi = state === "Delhi";
    res.json([
      { id: "AWD-2026-001", projectId: "PRJ-2026-001", projectName: "Delhi-Mumbai Expressway (Phase 4)", date: "2026-03-15", totalAmount: 450000000, beneficiariesCount: 152, status: "Published", issuingAuthority: "District Collector, Nuh" },
      { id: "AWD-2026-002", projectId: "PRJ-2026-002", projectName: "Pune-Nashik Semi High-Speed Rail", date: "2026-05-22", totalAmount: 820000000, beneficiariesCount: 340, status: "Draft", issuingAuthority: "Competent Authority, Pune" },
      { id: "AWD-2026-003", projectId: "PRJ-2026-003", projectName: "Chennai-Bengaluru Industrial Corridor", date: "2026-01-10", totalAmount: 120000000, beneficiariesCount: 45, status: "Under Review", issuingAuthority: "District LAO, Kanchipuram" },
    ]);
  });

  app.get("/api/reports", (req, res) => {
      const state = req.query.state || "All States";
      const isDelhi = state === "Delhi";
    res.json([
      { id: "REP-991", title: "Q3 State-wise Acquisition Progress", type: "Progress", generatedDate: "2026-09-01", generatedBy: "System", format: "PDF", size: "2.4 MB" },
      { id: "REP-992", title: "DBT Disbursement Delay Analysis", type: "Financial", generatedDate: "2026-08-28", generatedBy: "Admin", format: "XLSX", size: "1.1 MB" },
      { id: "REP-993", title: "Pending R&R Settlements - Maharashtra", type: "Social", generatedDate: "2026-08-15", generatedBy: "SIA Officer", format: "PDF", size: "3.5 MB" },
    ]);
  });

  app.get("/api/grievances", (req, res) => {
      const state = req.query.state || "All States";
      const isDelhi = state === "Delhi";
    res.json([
      { id: "GRV-001", trackingId: "G-2026-MH-4421", category: "Compensation Assessment", description: "Market value assessed is lower than recent circle rate revisions.", submittedBy: "Ramesh Singh", submittedDate: "2026-09-02", status: "Open", assignedTo: "District LAO", priority: "High" },
      { id: "GRV-002", trackingId: "G-2026-HR-1132", category: "R&R Eligibility", description: "Not included in displaced list despite living on parcel for 5 years.", submittedBy: "Abdul Khan", submittedDate: "2026-08-15", status: "In Progress", assignedTo: "SIA Authority", priority: "Medium" },
      { id: "GRV-003", trackingId: "G-2026-TN-9984", category: "Measurement Dispute", description: "Acquired area is 0.5 Ha but notification states 0.8 Ha.", submittedBy: "Smt. Kavita Patil", submittedDate: "2026-07-10", status: "Resolved", assignedTo: "Surveyor Dept", priority: "Low" },
    ]);
  });

  app.get("/api/workflow", (req, res) => {
    const projs = filterProjects(req.query);
    if (projs.length === 0) return res.json([]);
    
    // Aggregate or use the first project's data if a specific one is selected
    const p = projs[0];
    const stages = [
      { id: 1, name: "notification", status: p.stage === "Notification" ? "current" : "completed", date: p.dateSubmitted },
      { id: 2, name: "declaration", status: p.stage === "Declaration" ? "current" : (["Award", "Compensation", "Possession", "R&R"].includes(p.stage) ? "completed" : "pending"), date: "2026-03-15" },
      { id: 3, name: "award", status: p.stage === "Award" ? "current" : (["Compensation", "Possession", "R&R"].includes(p.stage) ? "completed" : "pending"), date: "Pending · Due 2026-06-15" },
      { id: 4, name: "compensation", status: p.stage === "Compensation" ? "current" : (["Possession", "R&R"].includes(p.stage) ? "completed" : "pending"), date: "Pending · Due 2026-08-01" },
      { id: 5, name: "possession", status: p.stage === "Possession" ? "current" : (p.stage === "R&R" ? "completed" : "pending"), date: "Pending · Due 2026-10-15" },
      { id: 6, name: "rnr", status: p.stage === "R&R" ? "current" : "pending", date: "Pending" }
    ];
    res.json(stages);
  });
  
  app.get("/api/risk", (req, res) => {
    const projs = filterProjects(req.query);
    const risks = projs.map(p => ({
      id: p.id, projectName: p.projectName, state: p.state, district: p.district,
      level: p.riskProfile.level, score: p.riskProfile.score, factors: p.riskProfile.factors,
      stage: p.stage
    }));
    res.json(risks);
  });

  app.get("/api/kpis", (req, res) => {
    const projs = filterProjects(req.query);
    
    let areaNotified = 0;
    let areaAcquired = 0;
    let compensationAssessed = 0;
    let compensationPaid = 0;
    let familiesAffected = 0;
    let rrSettled = 0;
    
    projs.forEach(p => {
      areaNotified += p.areaNotified || 0;
      areaAcquired += p.areaAcquired || 0;
      compensationAssessed += p.compensationAssessed || 0;
      compensationPaid += p.compensationPaid || 0;
      familiesAffected += p.familiesAffected || 0;
      rrSettled += p.rrSettled || 0;
    });

    res.json({
      areaNotified: Number(areaNotified.toFixed(1)),
      areaAcquired: Number(areaAcquired.toFixed(1)),
      compensationAssessed: Number(compensationAssessed.toFixed(1)),
      compensationDisbursed: Number(compensationPaid.toFixed(1)),
      familiesAffected: Math.floor(familiesAffected),
      familiesRnR: Math.floor(rrSettled),
      activeProjects: projs.length
    });
  });
  // replace the old one
  app.get("/api/parcels", (req, res) => {
    const projs = filterProjects(req.query);
    const validStates = projs.map(p => p.state);
    
    // Minimal mock parcels mapping to states
    const parcels = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [[[77.017, 28.124], [77.019, 28.124], [77.019, 28.126], [77.017, 28.126], [77.017, 28.124]]] },
          properties: { ulpin: "06122344556677", project: "Delhi-Mumbai Expressway (Phase 4)", status: "Notification", state: "Haryana", district: "Nuh", village: "Khedki", area: 1.2, khasra: "45/2", landType: "Agricultural", owner: "Private" }
        },
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [[[77.020, 28.120], [77.022, 28.120], [77.022, 28.122], [77.020, 28.122], [77.020, 28.120]]] },
          properties: { ulpin: "06122344556678", project: "Delhi-Mumbai Expressway (Phase 4)", status: "Award", state: "Haryana", district: "Nuh", village: "Khedki", area: 2.1, khasra: "46/1", landType: "Commercial", owner: "Private" }
        },
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [[[73.856, 18.520], [73.858, 18.520], [73.858, 18.522], [73.856, 18.522], [73.856, 18.520]]] },
          properties: { ulpin: "27122344556677", project: "Pune-Nashik Semi High-Speed Rail", status: "Declaration", state: "Maharashtra", district: "Pune", village: "Shivajinagar", area: 0.5, khasra: "12/A", landType: "Residential", owner: "Private" }
        }
      ]
    };
    
    // Filter by matching state/district/project via properties.project or properties.state
    const projNames = projs.map(p => p.projectName);
    const filteredFeatures = parcels.features.filter(f => projNames.includes(f.properties.project));
    
    res.json({ type: "FeatureCollection", features: filteredFeatures });
  });

  // Vite middleware for development

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const wss = new WebSocketServer({ noServer: true });
  
  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === 1) {
          client.send(msg.toString());
        }
      });
    });
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

}
startServer();
