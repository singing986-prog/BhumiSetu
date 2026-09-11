const fs = require('fs');
let code = fs.readFileSync('src/components/Proposals.tsx', 'utf8');

const step4code = `
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-registry-ink border-b border-registry-ink/10 pb-2">Supporting Documents</h3>
                <div className="bg-survey-paper/30 p-4 border border-graticule-teal/20 rounded-sm">
                  <p className="text-sm text-registry-ink/70 mb-3">Upload relevant preliminary documents (KML alignment, concept note, etc.)</p>
                  <div className="flex items-center gap-4">
                     <input type="file" className="text-sm text-registry-ink/80 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:bg-graticule-teal/10 file:text-graticule-teal hover:file:bg-graticule-teal/20 cursor-pointer" />
                     <button type="button" className="px-4 py-1.5 bg-graticule-teal text-white text-sm rounded-sm" onClick={(e) => { e.preventDefault(); alert('Document uploaded and attached to proposal.'); }}>Upload</button>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
`;

code = code.replace(
  /\{step === 4 && \(\s*<div className="space-y-4">\s*<h3 className="font-semibold text-registry-ink border-b border-registry-ink\/10 pb-2">Review Details<\/h3>/,
  step4code + '<h3 className="font-semibold text-registry-ink border-b border-registry-ink/10 pb-2">Review Details</h3>'
);

// update step max to 5
code = code.replace(/step < 4 \?/g, "step < 5 ?");
code = code.replace(/Step \{step\} of 4/g, "Step {step} of 5");
code = code.replace(/\[1, 2, 3, 4\]\.map/g, "[1, 2, 3, 4, 5].map");

fs.writeFileSync('src/components/Proposals.tsx', code);
console.log("Updated Proposals.tsx step 4 docs");
