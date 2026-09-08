const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'import { useState } from "react";',
  'import { useState, useEffect } from "react";'
);

fs.writeFileSync('src/App.tsx', content);
