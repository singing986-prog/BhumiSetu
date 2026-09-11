import fs from 'fs';
let content = fs.readFileSync('src/components/Documents.tsx', 'utf-8');

const oldDownload = /const handleDownload = [\s\S]*?window\.open\(url, '_blank'\);\n  \};/;

const newDownload = `const handleDownload = async (id: string, version?: string) => {
     let url = \`/api/documents/\${id}/download\`;
     if (version) url += \`/\${version}\`;
     
     try {
        const res = await apiFetch(url);
        if (!res.ok) {
           alert("Failed to download document");
           return;
        }
        const blob = await res.blob();
        
        const disposition = res.headers.get('content-disposition');
        let filename = \`\${id}.pdf\`;
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\\n]*=((['"]).*?\\2|[^;\\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }

        const windowUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = windowUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(windowUrl);
     } catch (err) {
        console.error("Download error", err);
     }
  };`;

content = content.replace(oldDownload, newDownload);
fs.writeFileSync('src/components/Documents.tsx', content);
