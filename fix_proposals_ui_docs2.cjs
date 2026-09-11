const fs = require('fs');
let code = fs.readFileSync('src/components/Proposals.tsx', 'utf8');

const step4code = `
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-registry-ink border-b border-registry-ink/10 pb-2">Supporting Documents</h3>
                <div className="bg-survey-paper/30 p-4 border border-graticule-teal/20 rounded-sm">
                  <p className="text-sm text-registry-ink/70 mb-3">Upload relevant preliminary documents (KML alignment, concept note, etc.)</p>
                  <div className="flex items-center gap-4">
                     <input type="file" onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if(file && activeProposal) {
                             const docFormData = new FormData();
                             docFormData.append('file', file);
                             try {
                                 const res = await apiFetch(\`/api/proposals/\${activeProposal.id}/documents\`, {
                                     method: "POST",
                                     body: docFormData,
                                     headers: { "Accept": "application/json" } // Don't set Content-Type, let browser set it with boundary
                                 });
                                 const data = await res.json();
                                 if(!data.error) {
                                     alert("Document uploaded successfully with SHA-256 validation.");
                                 } else {
                                     alert("Error: " + data.error);
                                 }
                             } catch(e) {
                                 console.error(e);
                                 alert("Upload failed.");
                             }
                         } else if (file && !activeProposal) {
                             // Temporarily store file in state for creation mode
                             setFormData({...formData, attachedFile: file, attachedFileName: file.name});
                         }
                     }} className="text-sm text-registry-ink/80 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:bg-graticule-teal/10 file:text-graticule-teal hover:file:bg-graticule-teal/20 cursor-pointer" />
                  </div>
                  {formData.attachedFileName && <div className="mt-2 text-sm text-cultivated-green">Prepared for submission: {formData.attachedFileName}</div>}
                </div>
              </div>
            )}
`;

code = code.replace(
  /\{step === 4 && \([\s\S]*?\{\/\* END STEP 4 \*\/\}/,
  step4code + " {/* END STEP 4 */}"
);

// Fallback if comment not found
code = code.replace(
  /\{step === 4 && \(\s*<div className="space-y-4">\s*<h3 className="font-semibold text-registry-ink border-b border-registry-ink\/10 pb-2">Supporting Documents<\/h3>[\s\S]*?<\/div>\s*\)\}/,
  step4code
);

// Update createSubmit to upload document if exists
const createSubmitCode = `
      const data = await res.json();
      if (!data.error) {
        if(formData.attachedFile) {
           const docFormData = new FormData();
           docFormData.append('file', formData.attachedFile);
           await apiFetch(\`/api/proposals/\${data.proposal.id}/documents\`, {
               method: "POST",
               body: docFormData,
           });
        }
        await fetchProposals();
        setActiveProposal(data.proposal);
        setView("detail");
      }
`;
code = code.replace(
  /const data = await res\.json\(\);\s*if \(\!data\.error\) \{\s*await fetchProposals\(\);\s*setActiveProposal\(data\.proposal\);\s*setView\("detail"\);\s*\}/,
  createSubmitCode
);


fs.writeFileSync('src/components/Proposals.tsx', code);
console.log("Updated Proposals.tsx step 4 docs (real upload)");
