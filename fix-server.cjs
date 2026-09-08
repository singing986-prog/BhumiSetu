const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'projectName: (isDelhi ? "Delhi-Meerut RRTS" : "Pune-Nashik Semi High-Speed Rail"),',
  'projectName: "Pune-Nashik Semi High-Speed Rail",'
);
content = content.replace(
  'projectName: (isDelhi ? "Delhi Metro Link" : "Delhi-Mumbai Expressway"),',
  'projectName: "Delhi-Mumbai Expressway",'
);
content = content.replace(
  'projectName: (isDelhi ? "Dwarka Expressway" : "Chennai-Bengaluru Industrial Corridor"),',
  'projectName: "Chennai-Bengaluru Industrial Corridor",'
);
content = content.replace(
  'title: (isDelhi ? "Gazette_Sec11_Delhi_Signed.pdf" : "Gazette_Sec11_3(A)_Nuh_Signed.pdf"),',
  'title: "Gazette_Sec11_3(A)_Nuh_Signed.pdf",'
);

fs.writeFileSync('server.ts', content);
