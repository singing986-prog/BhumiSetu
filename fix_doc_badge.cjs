const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const target = `<h4 className="font-serif font-bold text-center text-xl text-registry-ink mb-6 mt-4 border-b border-registry-ink/20 pb-4">{previewDoc.title}</h4>`;
const replacement = `<h4 className="font-serif font-bold text-center text-xl text-registry-ink mb-6 mt-4 border-b border-registry-ink/20 pb-4">{previewDoc.title} <div className="text-xs bg-graticule-teal/10 text-graticule-teal inline-block px-2 py-0.5 rounded ml-2 align-middle border border-graticule-teal/30">DEMO DOCUMENT</div></h4>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/Dashboard.tsx', code);
}
