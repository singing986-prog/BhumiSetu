import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

code = code.replace(
  '                   </div>\n                </div>\n             ) : (',
  '                   </div>\n                </div>\n                </div>\n             ) : ('
);

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map.tsx missing div closing tag");
