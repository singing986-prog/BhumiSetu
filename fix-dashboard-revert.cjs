const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// The original ones for logical operations
content = content.replace(/\{t\("filter.allStates"\)\}/g, '"All States"');
content = content.replace(/t\("filter.allStates"\)/g, '"All States"');
content = content.replace(/t\("filter.allDistricts"\)/g, '"All Districts"');
content = content.replace(/t\("filter.allProjects"\)/g, '"All Projects"');
content = content.replace(/t\("filter.allStages"\)/g, '"All Stages"');
content = content.replace(/t\("filter.allCategories"\)/g, '"All Categories"');
content = content.replace(/t\("filter.allRisks"\)/g, '"All Risks"');

// Fix the JSX strings correctly
content = content.replace(/>All States</g, '>{t("filter.allStates")}<');
content = content.replace(/>All Districts</g, '>{t("filter.allDistricts")}<');
content = content.replace(/>All Projects</g, '>{t("filter.allProjects")}<');
content = content.replace(/>All Stages</g, '>{t("filter.allStages")}<');
content = content.replace(/>All Categories</g, '>{t("filter.allCategories")}<');
content = content.replace(/>All Risks</g, '>{t("filter.allRisks")}<');

// For <option value="All States">All States</option>, it should be:
// <option value="All States">{t("filter.allStates")}</option>
// The regex above will handle >All States<, but what about value? It shouldn't be translated!

content = content.replace(/value=\{?"All States"\}?/g, 'value="All States"');
content = content.replace(/value=\{?"All Districts"\}?/g, 'value="All Districts"');
content = content.replace(/value=\{?"All Projects"\}?/g, 'value="All Projects"');
content = content.replace(/value=\{?"All Stages"\}?/g, 'value="All Stages"');
content = content.replace(/value=\{?"All Categories"\}?/g, 'value="All Categories"');
content = content.replace(/value=\{?"All Risks"\}?/g, 'value="All Risks"');

content = content.replace(/>{docsCount} {t\("nav.documents"\)} {t\("stage.view"\)} &rarr;</g, '>{docsCount || 0} {t("nav.documents")} {t("stage.view")} &rarr;<');

fs.writeFileSync('src/components/Dashboard.tsx', content);
