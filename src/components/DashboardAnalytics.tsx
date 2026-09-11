import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';
import { apiFetch } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, Activity, Clock, ShieldCheck, Map, Filter } from 'lucide-react';

const COLORS = ['#10233F', '#A8672E', '#2F6B3A', '#B4392C', '#5E7B78', '#D4A373'];

export function DashboardAnalytics({ 
  selectedState = "All States", 
  selectedDistrict = "All Districts", 
  selectedProject = "All Projects", 
  selectedStage = "All Stages", 
  selectedCategory = "All Categories", 
  selectedRisk = "All Risks" 
}: any) {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<any[]>([]);
  const [parcels, setParcels] = useState<any[]>([]);
  
  useEffect(() => {
    const query = `?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`;
    
    Promise.all([
      apiFetch(`/api/projects${query}`).then(r => r.json()),
      apiFetch(`/api/parcels${query}`).then(r => r.json())
    ]).then(([projs, parcs]) => {
      setProjects(Array.isArray(projs) ? projs : []);
      if (parcs && parcs.features) {
        setParcels(parcs.features.map((f: any) => f.properties));
      } else {
        setParcels([]);
      }
    });
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk]);

  // 1. Acquisition Stage Funnel (based on parcels)
  const stageOrder = ["Notification", "Declaration", "Award", "Compensation", "Possession", "R&R"];
  const funnelData = stageOrder.map(stage => ({
    name: stage,
    count: parcels.filter(p => p.stage === stage).length
  }));

  // 2. Risk Heatmap equivalent (Bar Chart of Risk by District/Project)
  const riskGroups: Record<string, any> = {};
  projects.forEach(p => {
    const key = selectedDistrict === 'All Districts' ? p.district : p.projectName;
    if (!riskGroups[key]) riskGroups[key] = { name: key, High: 0, Medium: 0, Low: 0 };
    if (p.riskProfile && p.riskProfile.level) {
      riskGroups[key][p.riskProfile.level] += 1;
    }
  });
  const riskData = Object.values(riskGroups);

  // 3. Compensation Assessed vs Paid
  const compData = projects.map(p => ({
    name: p.id,
    Assessed: p.compensationAssessed || 0,
    Paid: p.compensationPaid || 0,
  }));

  // 4. Possession Status
  const possessionData = [
    { name: "Acquired", value: projects.reduce((acc, p) => acc + (p.areaAcquired || 0), 0) },
    { name: "Pending", value: projects.reduce((acc, p) => acc + ((p.areaRequired || 0) - (p.areaAcquired || 0)), 0) }
  ];

  return (
    <div className="flex flex-col gap-6 mt-6 px-6 pb-6 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-6 h-6 text-alluvium-red" />
        <h2 className="text-xl font-serif font-bold text-registry-ink">Comprehensive Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Funnel */}
        <div className="bg-white p-6 border border-graticule-teal/20 rounded-sm shadow-sm">
          <h3 className="text-sm font-semibold text-registry-ink mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-tilled-earth" /> 1. Acquisition Stage Funnel (Parcels)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill="#10233F" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Breakdown */}
        <div className="bg-white p-6 border border-graticule-teal/20 rounded-sm shadow-sm">
          <h3 className="text-sm font-semibold text-registry-ink mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-alluvium-red" /> 2. Delay-Risk Breakdown
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <BarChart data={riskData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 11}} tickFormatter={(val) => val.length > 10 ? val.substring(0,10)+'...' : val} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="High" stackId="a" fill="#B4392C" />
                <Bar dataKey="Medium" stackId="a" fill="#A8672E" />
                <Bar dataKey="Low" stackId="a" fill="#5E7B78" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compensation */}
        <div className="bg-white p-6 border border-graticule-teal/20 rounded-sm shadow-sm">
          <h3 className="text-sm font-semibold text-registry-ink mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cultivated-green" /> 3. Compensation: Assessed vs Paid (Cr)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <AreaChart data={compData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAssessed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10233F" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10233F" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F6B3A" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2F6B3A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Assessed" stroke="#10233F" fillOpacity={1} fill="url(#colorAssessed)" />
                <Area type="monotone" dataKey="Paid" stroke="#2F6B3A" fillOpacity={1} fill="url(#colorPaid)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Possession Status */}
        <div className="bg-white p-6 border border-graticule-teal/20 rounded-sm shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-registry-ink mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-graticule-teal" /> 4. Possession Status (Hectares)
          </h3>
          <div className="flex-1 h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={possessionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {possessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#2F6B3A' : '#B4392C'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
