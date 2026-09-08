const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  'onClick={() => setSelectedStage(null)} className="text-registry-ink/40',
  'onClick={() => setActiveWorkflowStage(null)} className="text-registry-ink/40'
);

content = content.replace(
  '{selectedStage.status === "completed" ? "Completed On" : "Deadline"}',
  '{activeWorkflowStage.status === "completed" ? "Completed On" : "Deadline"}'
);

content = content.replace(
  '{selectedStage.date.replace("Pending · Due ", "")}',
  '{activeWorkflowStage.date.replace("Pending · Due ", "")}'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
