const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const multer = require\('multer'\);/,
  "import multer from 'multer';"
);

fs.writeFileSync('server.ts', code);
console.log("Fixed multer import");
