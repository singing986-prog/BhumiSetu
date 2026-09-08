const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const notifEndpoint = `
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
`;

content = content.replace('app.get("/api/projects"', notifEndpoint + '\n  app.get("/api/projects"');
fs.writeFileSync('server.ts', content);
