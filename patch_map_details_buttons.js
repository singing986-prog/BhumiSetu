import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

// Need to pass setActiveTab to GISMap if it exists
if (!code.includes('export function GISMap({ setActiveTab, showSidebar')) {
  code = code.replace(
    'export function GISMap({ showSidebar = false, profile,',
    'export function GISMap({ setActiveTab, showSidebar = false, profile,'
  );
  code = code.replace(
    'selectedRisk?: string }) {',
    'selectedRisk?: string, setActiveTab?: (tab: string) => void }) {'
  );
}

const deepLinks = `
                   <div className="p-3 bg-white border-t border-graticule-teal/20 grid grid-cols-2 gap-2">
                     <button onClick={() => { if(setActiveTab) { setSelectedProject && setSelectedProject(selectedFeature.projectId || 'All Projects'); setActiveTab('dashboard'); } }} className="text-xs py-1.5 bg-graticule-teal/10 text-graticule-teal rounded hover:bg-graticule-teal/20">{t('View Dashboard', 'View Dashboard')}</button>
                     <button onClick={() => { if(setActiveTab) { setSelectedProject && setSelectedProject(selectedFeature.projectId || 'All Projects'); setActiveTab('proposals'); } }} className="text-xs py-1.5 bg-graticule-teal/10 text-graticule-teal rounded hover:bg-graticule-teal/20">{t('View Workflow', 'View Workflow')}</button>
                     <button onClick={() => { if(setActiveTab) { setSelectedProject && setSelectedProject(selectedFeature.projectId || 'All Projects'); setActiveTab('compensation'); } }} className="text-xs py-1.5 bg-graticule-teal/10 text-graticule-teal rounded hover:bg-graticule-teal/20">{t('View Compensation', 'View Compensation')}</button>
                     <button onClick={() => { if(setActiveTab) { setSelectedProject && setSelectedProject(selectedFeature.projectId || 'All Projects'); setActiveTab('rr'); } }} className="text-xs py-1.5 bg-graticule-teal/10 text-graticule-teal rounded hover:bg-graticule-teal/20">{t('View R&R', 'View R&R')}</button>
                     <button onClick={() => { if(setActiveTab) { setSelectedProject && setSelectedProject(selectedFeature.projectId || 'All Projects'); setActiveTab('documents'); } }} className="text-xs py-1.5 bg-graticule-teal/10 text-graticule-teal rounded hover:bg-graticule-teal/20">{t('View Documents', 'View Documents')}</button>
                     {profile?.role !== 'Auditor' && profile?.role !== 'Affected Citizen' && (
                       <button onClick={() => {
                          const feat = parcels?.features?.find((f:any) => 
                            (f.properties.ulpin && f.properties.ulpin === selectedFeature.ulpin) || 
                            (f.properties.parcelId && f.properties.parcelId === selectedFeature.parcelId)
                          );
                          if (feat && drawRef.current) {
                             drawRef.current.add(feat);
                             setActiveTool('draw');
                             setSelectedFeature(null);
                          }
                       }} className="text-xs py-1.5 bg-tilled-earth/10 text-tilled-earth rounded hover:bg-tilled-earth/20">{t('Edit Geometry', 'Edit Geometry')}</button>
                     )}
                     {profile?.role !== 'Auditor' && profile?.role !== 'Affected Citizen' && (
                       <button onClick={async () => {
                         if (confirm("Are you sure you want to delete this parcel?")) {
                           try {
                             const res = await window.fetch("/api/parcels/" + selectedFeature.parcelId, {
                               method: "DELETE",
                               headers: { "Authorization": "Bearer " + localStorage.getItem('bhoomi_token') }
                             });
                             if (res.ok) {
                               loadParcels();
                               setSelectedFeature(null);
                             } else alert("Unauthorized or error deleting parcel");
                           } catch (err) { console.error(err); }
                         }
                       }} className="text-xs py-1.5 bg-alluvium-red/10 text-alluvium-red rounded hover:bg-alluvium-red/20">{t('Delete Parcel', 'Delete')}</button>
                     )}
                   </div>
                </div>
`;

code = code.replace(/<\/div>\s*<\/div>\s*\) : \(/, deepLinks + '             ) : (');

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map with deep links and edit/delete buttons");
