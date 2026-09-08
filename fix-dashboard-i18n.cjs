const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// FilterBar i18n
content = content.replace(/"All States"/g, 't("filter.allStates")');
content = content.replace(/"All Districts"/g, 't("filter.allDistricts")');
content = content.replace(/"All Projects"/g, 't("filter.allProjects")');
content = content.replace(/"All Stages"/g, 't("filter.allStages")');
content = content.replace(/"All Categories"/g, 't("filter.allCategories")');
content = content.replace(/"All Risks"/g, 't("filter.allRisks")');
content = content.replace(/>Reset Filters</g, '>{t("filter.resetFilters")}<');
content = content.replace(/placeholder="Search projects, ULPIN..."/g, 'placeholder={t("filter.searchPlaceholder")}');

// Workflow Tracker
content = content.replace(/>Acquisition Lifecycle</g, '>{t("workflow.acquisitionLifecycle")}<');
content = content.replace(/>Award Deadline Risk</g, '>{t("workflow.awardDeadlineRisk")}<');
content = content.replace(/>Pending \u00B7 Due/g, '>{t("workflow.status.pending")} &middot; {t("workflow.due")}');
content = content.replace(/>Pending \u00B7 Blocked/g, '>{t("workflow.status.pending")} &middot; {t("workflow.blocked")}');
// The line: { id: 3, name: "award", status: p.stage === "Award" ? "current" : (["Compensation", "Possession", "R&R"].includes(p.stage) ? "completed" : "pending"), date: "Pending · Due 2026-06-15" }
// Actually it's set in server.ts!
// Let's leave date formatting to frontend. Wait, if date is set in backend as "Pending · Due 2026-06-15", we can't easily translate it in frontend. 
// I should update server.ts to return just the ISO date or null, and let frontend format it!

// But first, let's inject a generic formatting in WorkflowTracker modal.
content = content.replace(/>Status</g, '>{t("stage.status")}<');
content = content.replace(/>Deadline</g, '>{t("stage.deadline")}<');
content = content.replace(/>Responsible Authority</g, '>{t("stage.responsibleAuthority")}<');
content = content.replace(/>Linked Documents</g, '>{t("stage.linkedDocuments")}<');
content = content.replace(/>\s*?4 Documents View →\s*?</g, '>{docsCount} {t("nav.documents")} {t("stage.view")} &rarr;<');
content = content.replace(/>Pending Actions</g, '>{t("stage.pendingActions")}<');
content = content.replace(/>Stage Details</g, '>{t("stage.details")}<');

// PredictiveRisk
content = content.replace(/>Acquisition Risk Watch</g, '>{t("risk.acquisitionRiskWatch")}<');
content = content.replace(/>\s*?projects require immediate attention\s*?</g, '> {t("risk.projectsRequireAttention")} <');
content = content.replace(/>\s*?HIGH RISK\s*?</g, '>{t("risk.high")}<');
content = content.replace(/>\s*?days overdue\s*?</g, '> {t("risk.daysOverdue")} <');
content = content.replace(/>\s*?contributing risk factors:\s*?</g, '>{t("risk.contributingRiskFactors")}:<');
content = content.replace(/>\s*?View intervention plan →\s*?</g, '>{t("risk.viewInterventionPlan")} &rarr;<');

fs.writeFileSync('src/components/Dashboard.tsx', content);
