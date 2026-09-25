import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';
import { SEVERITY_CONFIG } from '../../lib/severitySystem';
import { Case, Evidence, Alert } from '../../types';

interface CrimeStatisticsChartsProps {
  cases: Case[];
  evidenceList: Evidence[];
  alerts: Alert[];
}

export const CrimeStatisticsCharts: React.FC<CrimeStatisticsChartsProps> = ({
  cases,
  evidenceList,
  alerts,
}) => {
  // 1. Data for Bar Chart: Caseload & Evidence Exhibits by Crime Category
  const categoryData = React.useMemo(() => {
    const categories: Record<string, { name: string; cases: number; evidence: number; entities: number }> = {
      'Women-Related Cyber': { name: 'Women Cyber', cases: 0, evidence: 0, entities: 0 },
      'Financial Hawala': { name: 'Hawala & Shells', cases: 0, evidence: 0, entities: 0 },
      'FinTech Fraud': { name: 'FinTech Fraud', cases: 0, evidence: 0, entities: 0 },
      'Maritime Narcotics': { name: 'Narcotics', cases: 0, evidence: 0, entities: 0 },
    };

    cases.forEach((c) => {
      let key = 'Financial Hawala';
      if (c.caseFlags?.includes('WOMEN_RELATED') || c.category?.toLowerCase().includes('women')) {
        key = 'Women-Related Cyber';
      } else if (c.category?.toLowerCase().includes('fintech') || c.category?.toLowerCase().includes('loan')) {
        key = 'FinTech Fraud';
      } else if (c.category?.toLowerCase().includes('narcotics')) {
        key = 'Maritime Narcotics';
      }

      if (categories[key]) {
        categories[key].cases += 1;
        // Count matching evidence items from evidenceList or case metric
        const matchingEvCount = evidenceList.filter((e) => e.caseId === c.id).length;
        categories[key].evidence += matchingEvCount > 0 ? matchingEvCount : (c.evidenceCount || 0);
        categories[key].entities += c.metrics?.totalEntities || 0;
      }
    });

    return Object.values(categories);
  }, [cases, evidenceList]);

  // 2. Data for Pie Chart: Threat & Alert Severity Distribution
  const severityPieData = React.useMemo(() => {
    const counts = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    alerts.forEach((a) => {
      if (counts[a.severity] !== undefined) {
        counts[a.severity] += 1;
      }
    });

    return [
      { name: 'Critical', value: counts.CRITICAL || 1, color: SEVERITY_CONFIG.CRITICAL.chartHex },
      { name: 'High', value: counts.HIGH || 1, color: SEVERITY_CONFIG.HIGH.chartHex },
      { name: 'Medium', value: counts.MEDIUM || 1, color: SEVERITY_CONFIG.MEDIUM.chartHex },
      { name: 'Low', value: counts.LOW || 1, color: SEVERITY_CONFIG.LOW.chartHex },
    ];
  }, [alerts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Chart 1: Bar Chart of Crime Category Breakdown */}
      <div className="bg-forge-card border border-forge-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-forge-border/60 pb-2.5">
          <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs font-bold">
            <BarChart3 className="w-4 h-4" />
            <span>CASELOAD &amp; EXHIBITS BY CRIME CATEGORY</span>
          </div>
          <span className="text-[10px] font-mono text-forge-text-muted">4 OPERATIONS</span>
        </div>

        <div className="h-56 w-full text-xs font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-forge-panel border border-forge-border p-2.5 rounded shadow-lg font-mono text-xs space-y-1">
                        <div className="text-white font-bold">{data.name}</div>
                        <div className="text-forge-cyan text-[11px]">
                          Exhibits Indexed: <span className="font-bold text-white">{data.evidence}</span>
                        </div>
                        <div className="text-forge-emerald text-[11px]">
                          Entities Tracked: <span className="font-bold text-white">{data.entities}</span>
                        </div>
                        <div className="text-forge-text-muted text-[10px]">
                          Active Operations: {data.cases}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="evidence" fill="#06b6d4" name="Sealed Exhibits" radius={[3, 3, 0, 0]} />
              <Bar dataKey="entities" fill="#10b981" name="Tracked Entities" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center space-x-6 text-[10px] font-mono pt-1 text-forge-text-muted">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-forge-cyan" />
            <span>Sealed Exhibits</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-forge-emerald" />
            <span>Tracked Entities</span>
          </div>
        </div>
      </div>

      {/* Chart 2: Donut / Pie Chart of Threat Severity Breakdown */}
      <div className="bg-forge-card border border-forge-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-forge-border/60 pb-2.5">
          <div className="flex items-center space-x-2 text-forge-rose font-mono text-xs font-bold">
            <PieIcon className="w-4 h-4" />
            <span>PORTFOLIO THREAT SEVERITY DISTRIBUTION</span>
          </div>
          <span className="text-[10px] font-mono text-forge-text-muted">REAL-TIME TELEMETRY</span>
        </div>

        <div className="h-56 w-full text-xs font-mono flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityPieData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {severityPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#1e293b" strokeWidth={1.5} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="bg-forge-panel border border-forge-border p-2 rounded shadow-lg font-mono text-xs">
                        <div className="font-bold text-white">{data.name} Threat</div>
                        <div className="text-forge-text-secondary text-[11px] mt-0.5">
                          Active Alerts: <span className="font-bold text-white">{data.value}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-4 text-[10px] font-mono pt-1 text-forge-text-muted flex-wrap">
          {severityPieData.map((item) => (
            <div key={item.name} className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-forge-text-secondary font-medium">
                {item.name}: <span className="font-bold text-white">{item.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
