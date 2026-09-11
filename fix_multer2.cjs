const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We have import inside a function. Move to top
code = code.replace(/import multer from 'multer';\s*/, '');
code = 'import multer from "multer";\n' + code;

fs.writeFileSync('server.ts', code);
console.log("Moved multer import to top");
