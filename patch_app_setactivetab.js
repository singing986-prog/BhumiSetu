import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '{activeTab === "map" && <div className="h-full w-full absolute inset-0"><MapView profile={profile}',
  '{activeTab === "map" && <div className="h-full w-full absolute inset-0"><MapView setActiveTab={setActiveTab} profile={profile}'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with setActiveTab");
