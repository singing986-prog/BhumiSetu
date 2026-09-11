const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Change handleExecute(action.name) to handleExecute(action)
code = code.replace(/onClick=\{\(\) => handleExecute\(action\.name\)\}/g, "onClick={() => handleExecute(action)}");

// Change handleExecute definition
code = code.replace(
  /const handleExecute = \(actionName: string\) => \{\n\s*setExecuteModal\(\{ actionName \}\);\n\s*\};/,
  "const handleExecute = (action: any) => {\n     setExecuteModal({ actionName: action.name, actionId: action.id });\n  };"
);

// Change submitExecute body payload
code = code.replace(
  /actionId: executeModal\.actionName,/,
  "actionId: executeModal.actionId,"
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Updated Dashboard UI for actionId");
