import fs from 'fs';

const code = `
  const canUpload = profile?.role !== "Auditor" && profile?.role !== "Affected Citizen";

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-tilled-earth" />
            Document Repository
          </h2>
          <p className="text-registry-ink/60 mt-1">Versioned, tamper-evident document storage with digital signature tracking.</p>
        </div>
        {canUpload && (
           <button onClick={() => { setIsUploadVersion(false); setIsUploadOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-registry-ink text-white font-medium hover:bg-registry-ink/90 transition-colors rounded-sm shadow-sm">
             <Upload className="w-4 h-4" /> Upload Document
           </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-graticule-teal" />
          <input 
            type="text" 
            placeholder="Search Title, ID, or Filename..."
            className="w-full pl-9 pr-4 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="border border-graticule-teal/30 px-4 py-2 outline-none text-sm rounded-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
           <option value="ALL">All Types</option>
           <option value="NOTIFICATION">Notification</option>
           <option value="DECLARATION">Declaration</option>
           <option value="AWARD">Award</option>
           <option value="REPORT">Report</option>
           <option value="R&R">R&R</option>
           <option value="OTHER">Other</option>
        </select>
        <select className="border border-graticule-teal/30 px-4 py-2 outline-none text-sm rounded-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
           <option value="ALL">All Statuses</option>
           <option value="VERIFIED">Verified</option>
           <option value="PENDING_REVIEW">Pending Review</option>
           <option value="DRAFT">Draft</option>
        </select>
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-graticule-teal/10 border-b border-graticule-teal/30 text-registry-ink font-semibold">
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-[10px]">Doc ID</th>
                <th className="px-6 py-4">Title / Type</th>
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-[10px]">Version</th>
                <th className="px-6 py-4">Uploaded By</th>
                <th className="px-6 py-4">Status & Integrity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center animate-pulse text-graticule-teal">Loading documents...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-registry-ink/50">No documents found.</td></tr>
              ) : records.map((record, i) => (
                <motion.tr initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} transition={{delay: i*0.05}} key={record.id} className="hover:bg-graticule-teal/5 cursor-pointer" onClick={() => setSelectedDoc(record)}>
                   <td className="px-6 py-4 font-mono text-xs text-graticule-teal">{record.id}</td>
                   <td className="px-6 py-4">
                      <div className="font-medium text-registry-ink">{record.title}</div>
                      <div className="text-[10px] uppercase tracking-wider text-registry-ink/60">{record.type} • {record.fileSize}</div>
                   </td>
                   <td className="px-6 py-4 font-mono text-xs">v{record.version}</td>
                   <td className="px-6 py-4">
                      <div className="text-registry-ink">{record.uploadedBy}</div>
                      <div className="text-[10px] text-registry-ink/60">{new Date(record.uploadedAt).toLocaleDateString()}</div>
                   </td>
                   <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 mb-1">
                         {record.status === "VERIFIED" ? <CheckCircle2 className="w-3 h-3 text-cultivated-green" /> : <ShieldAlert className="w-3 h-3 text-tilled-earth" />}
                         <span className="text-[10px] font-bold tracking-wider uppercase">{record.status.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         {record.integrityStatus === "VERIFIED" ? <ShieldCheck className="w-3 h-3 text-cultivated-green" /> : <ShieldAlert className="w-3 h-3 text-alluvium-red" />}
                         <span className={\`text-[10px] font-bold tracking-wider uppercase \${record.integrityStatus === "VERIFIED" ? "text-cultivated-green" : "text-alluvium-red"}\`}>
                            {record.integrityStatus === "INTEGRITY_MISMATCH" ? "Integrity Failed" : record.integrityStatus.replace(/_/g, ' ')}
                         </span>
                      </div>
                   </td>
                   <td className="px-6 py-4 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleDownload(record.id)} className="p-2 text-graticule-teal hover:bg-graticule-teal/10 rounded-sm" title="Download"><Download className="w-4 h-4" /></button>
                      <button onClick={() => handleVerifyIntegrity(record.id)} className="p-2 text-tilled-earth hover:bg-tilled-earth/10 rounded-sm" title="Verify Integrity"><FileCheck className="w-4 h-4" /></button>
                   </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
`;
fs.appendFileSync('src/components/Documents.tsx', code);
