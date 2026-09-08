import { useState, useEffect } from "react";
import { KPI } from "../types";
import { motion } from "motion/react";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useTranslation } from "../i18n";

export function KPILedger() {
  const [kpis, setKpis] = useState<KPI | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetch("/api/kpis")
      .then((res) => res.json())
      .then((data) => setKpis(data));
  }, []);

  if (!kpis) return <div className="h-24 animate-pulse bg-graticule-teal/10" />;

  const metrics = [
    { label: t("dashboard.kpi.areaNotified"), value: kpis.areaNotified },
    { label: t("dashboard.kpi.areaAcquired"), value: kpis.areaAcquired },
    { label: t("dashboard.kpi.compAssessed"), value: kpis.compensationAssessed },
    { label: t("dashboard.kpi.compPaid"), value: kpis.compensationDisbursed },
    { label: t("dashboard.kpi.familiesAffected"), value: kpis.familiesAffected },
    { label: t("dashboard.kpi.rnrSettled"), value: kpis.familiesRnR },
  ];

  return (
    <div className="flex flex-nowrap overflow-x-auto border-b border-graticule-teal/30 bg-white">
      {metrics.map((metric, i) => (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          key={metric.label}
          className={`flex-1 min-w-[160px] p-4 ${
            i !== metrics.length - 1 ? "border-r border-graticule-teal/30" : ""
          }`}
        >
          <div className="text-xs text-registry-ink/60 font-medium uppercase tracking-wider mb-1">
            {metric.label}
          </div>
          <div className="text-2xl font-serif font-semibold text-registry-ink">
            {metric.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function PredictiveRisk() {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-6 border border-graticule-teal/30 h-full flex flex-col mt-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-lg font-semibold text-registry-ink">{t("dashboard.riskTitle")}</h3>
          <p className="text-sm text-registry-ink/60">{t("risk.desc")}</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 shrink-0 rounded-full bg-alluvium-red/10 border-4 border-alluvium-red/20 flex items-center justify-center">
            <span className="text-alluvium-red font-bold font-serif text-xl">1</span>
          </div>
          <div>
            <h4 className="font-medium text-registry-ink">{t("risk.high")}</h4>
            <p className="text-xs text-registry-ink/60 mt-1">{t("risk.project1", "Western Dedicated Freight Corridor Phase 3")}</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 shrink-0 rounded-full bg-tilled-earth/10 border-4 border-tilled-earth/20 flex items-center justify-center">
            <span className="text-tilled-earth font-bold font-serif text-xl">1</span>
          </div>
          <div>
            <h4 className="font-medium text-registry-ink">{t("risk.medium")}</h4>
            <p className="text-xs text-registry-ink/60 mt-1">{t("risk.project2", "Godavari Irrigation Canal Ext.")}</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 shrink-0 rounded-full bg-cultivated-green/10 border-4 border-cultivated-green/20 flex items-center justify-center">
            <span className="text-cultivated-green font-bold font-serif text-xl">1</span>
          </div>
          <div>
            <h4 className="font-medium text-registry-ink">{t("risk.low")}</h4>
            <p className="text-xs text-registry-ink/60 mt-1">{t("risk.project3", "Delhi-Dehradun Expressway")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export function WorkflowTracker() {
  const { t } = useTranslation();
  const stages = [
    { id: 1, name: t("workflow.notification"), status: "completed", date: "12 Oct 2025" },
    { id: 2, name: t("workflow.declaration"), status: "completed", date: "05 Nov 2025" },
    { id: 3, name: t("workflow.award"), status: "current", date: "Pending (Due: 10 Dec)" },
    { id: 4, name: t("workflow.compensation"), status: "pending", date: "-" },
    { id: 5, name: t("workflow.possession"), status: "pending", date: "-" },
    { id: 6, name: t("workflow.rnr"), status: "pending", date: "-" },
  ];

  return (
    <div className="bg-white p-6 border border-graticule-teal/30 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-lg font-semibold text-registry-ink">{t("dashboard.trackerTitle")}</h3>
          <p className="text-sm text-registry-ink/60">{t("workflow.actLabel")}</p>
        </div>
        <div className="px-3 py-1 bg-alluvium-red/10 text-alluvium-red border border-alluvium-red/30 text-xs font-medium rounded-sm flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          {t("workflow.lapseRisk")}
        </div>
      </div>

      <div className="relative flex-1 flex flex-col">
        {stages.map((stage, i) => (
          <div key={stage.id} className="relative flex gap-4 pb-6 flex-1">
            {/* Connecting line */}
            {i !== stages.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-px bg-graticule-teal/30 -translate-x-1/2"></div>
            )}
            
            <div className="relative z-10 bg-white">
              {stage.status === "completed" ? (
                <CheckCircle2 className="w-6 h-6 text-cultivated-green" />
              ) : stage.status === "current" ? (
                <div className="w-6 h-6 rounded-full border-2 border-tilled-earth flex items-center justify-center bg-white">
                  <div className="w-2.5 h-2.5 rounded-full bg-tilled-earth"></div>
                </div>
              ) : (
                <Circle className="w-6 h-6 text-graticule-teal/40" />
              )}
            </div>
            
            <div className="-mt-1">
              <div className={`font-medium ${stage.status === "pending" ? "text-registry-ink/50" : "text-registry-ink"}`}>
                <span className="font-mono text-xs text-graticule-teal mr-2">{stage.id.toString().padStart(2, '0')}</span>
                {stage.name}
              </div>
              <div className={`text-xs mt-0.5 ${stage.status === "current" ? "text-alluvium-red font-medium" : "text-registry-ink/60"}`}>
                {stage.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
