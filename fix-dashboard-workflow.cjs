const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Inside WorkflowTracker
content = content.replace(
  'const [selectedStage, setSelectedStage] = useState<any>(null);',
  'const [activeWorkflowStage, setActiveWorkflowStage] = useState<any>(null);'
);

content = content.replace(
  'onClick={() => setSelectedStage(stage)}',
  'onClick={() => setActiveWorkflowStage(stage)}'
);

content = content.replace(
  'onClick={() => setSelectedStage(null)}',
  'onClick={() => setActiveWorkflowStage(null)}'
);

content = content.replace(
  '{selectedStage && (',
  '{activeWorkflowStage && ('
);

content = content.replace(
  '{selectedStage.name}',
  '{activeWorkflowStage.name}'
);
content = content.replace(
  '{selectedStage.name}',
  '{activeWorkflowStage.name}'
);
content = content.replace(
  'font-medium text-registry-ink">{selectedStage.date}',
  'font-medium text-registry-ink">{activeWorkflowStage.date}'
);
content = content.replace(
  '{selectedStage.status}',
  '{activeWorkflowStage.status}'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
