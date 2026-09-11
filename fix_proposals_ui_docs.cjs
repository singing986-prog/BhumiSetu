const fs = require('fs');
let code = fs.readFileSync('src/components/Proposals.tsx', 'utf8');

const step4code = `
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-registry-ink border-b border-registry-ink/10 pb-2">Supporting Documents</h3>
                <div className="bg-survey-paper/30 p-4 border border-graticule-teal/20 rounded-sm">
                  <p className="text-sm text-registry-ink/70 mb-3">Upload relevant preliminary documents (KML alignment, concept note, etc.)</p>
                  <div className="flex items-center gap-4">
                     <input type="file" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if(file) {
                             // Mocking upload for UI - real implementation requires multipart form data to an endpoint that calculates SHA-256
                             setFormData({...formData, attachedFileName: file.name});
                             alert("File " + file.name + " prepared for upload.");
                         }
                     }} className="text-sm text-registry-ink/80 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:bg-graticule-teal/10 file:text-graticule-teal hover:file:bg-graticule-teal/20 cursor-pointer" />
                  </div>
                  {formData.attachedFileName && <div className="mt-2 text-sm text-cultivated-green">Prepared: {formData.attachedFileName}</div>}
                </div>
              </div>
            )}
`;

code = code.replace(
  /\{step === 4 && \([\s\S]*?\{\/\* END STEP 4 \*\/\}/,
  step4code
);

// Fallback replacement if the comment wasn't there
code = code.replace(
  /\{step === 4 && \(\s*<div className="space-y-4">\s*<h3 className="font-semibold text-registry-ink border-b border-registry-ink\/10 pb-2">Supporting Documents<\/h3>[\s\S]*?<\/div>\s*\)\}/,
  step4code
);


fs.writeFileSync('src/components/Proposals.tsx', code);
console.log("Updated Proposals.tsx step 4 docs (removing static alert)");
