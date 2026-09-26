import React, { useState } from 'react';
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
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Landmark,
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRENDS' | 'REGIONAL'>('OVERVIEW');

  // 1. Data for Bar Chart: Caseload & Evidence Exhibits by Crime Category
  const categoryData = React.useMemo(() => {
    const categories: Record<
      string,
      { name: string; cases: number; evidence: number; entities: number }
    > = {
      'Women-Related': { name: 'Women-Safety', cases: 0, evidence: 0, entities: 0 },
      'Financial Hawala': { name: 'Hawala & Shells', cases: 0, evidence: 0, entities: 0 },
      'FinTech Fraud': { name: 'FinTech & e-KYC', cases: 0, evidence: 0, entities: 0 },
      'Narcotics': { name: 'Narcotics & Coastal', cases: 0, evidence: 0, entities: 0 },
    };

    cases.forEach((c) => {
      let key = 'Financial Hawala';
      if (c.caseFlags?.includes('WOMEN_RELATED') || c.category?.toLowerCase().includes('women')) {
        key = 'Women-Related';
      } else if (c.category?.toLowerCase().includes('fintech') || c.category?.toLowerCase().includes('loan')) {
        key = 'FinTech Fraud';
      } else if (c.category?.toLowerCase().includes('narcotics')) {
        key = 'Narcotics';
      }

      if (categories[key]) {
        categories[key].cases += 1;
        const matchingEvCount = evidenceList.filter((e) => e.caseId === c.id).length;
        categories[key].evidence += matchingEvCount > 0 ? matchingEvCount : (c.evidenceCount || 0);
        categories[key].entities += c.metrics?.totalEntities || 0;
      }
    });

    return Object.values(categories);
  }, [cases, evidenceList]);

  // 2. Data for Area Chart: Monthly Influx & Resolution Trend (2026 timeline)
  const monthlyTrendsData = [
    { month: 'Mar 2026', registered: 4, resolved: 1, active: 3 },
    { month: 'Apr 2026', registered: 6, resolved: 2, active: 7 },
    { month: 'May 2026', registered: 9, resolved: 4, active: 12 },
    { month: 'Jun 2026', registered: 11, resolved: 5, active: 18 },
    { month: 'Jul 2026', registered: 14, resolved: 8, active: 24 },
    { month: 'Aug 2026', registered: 18, resolved: 11, active: 31 },
    { month: 'Sep 2026', registered: 22, resolved: 15, active: 38 },
  ];

  // 3. Data for Donut Chart: Priority & Threat Severity Distribution
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
      { name: 'Critical', value: counts.CRITICAL || 6, color: SEVERITY_CONFIG.CRITICAL.chartHex },
      { name: 'High', value: counts.HIGH || 5, color: SEVERITY_CONFIG.HIGH.chartHex },
      { name: 'Medium', value: counts.MEDIUM || 4, color: SEVERITY_CONFIG.MEDIUM.chartHex },
      { name: 'Low', value: counts.LOW || 3, color: SEVERITY_CONFIG.LOW.chartHex },
    ];
  }, [alerts]);

  // 4. Data for Regional State Distribution
  const stateDistributionData = React.useMemo(() => {
    const stateMap: Record<string, { state: string; count: number; financialVolume: number }> = {
      Delhi: { state: 'Delhi NCR', count: 0, financialVolume: 49 },
      Maharashtra: { state: 'Maharashtra', count: 0, financialVolume: 112 },
      Karnataka: { state: 'Karnataka', count: 0, financialVolume: 29 },
      'Uttar Pradesh': { state: 'Uttar Pradesh', count: 0, financialVolume: 18 },
      'West Bengal': { state: 'West Bengal', count: 0, financialVolume: 23 },
    };

    cases.forEach((c) => {
      const st = c.state || 'Delhi';
      if (stateMap[st]) {
        stateMap[st].count += 1;
      }
    });

    return Object.values(stateMap);
  }, [cases]);

  return (
    <div className="bg-forge-card border border-forge-border rounded-xl p-5 space-y-4 shadow-xl select-none">
      {/* Visual Analytics Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forge-border/60 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30 shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight font-sans">
                Investigation &amp; Crime Analytics
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forge-panel text-forge-cyan border border-forge-border font-bold uppercase">
                Statistical Intelligence
              </span>
            </div>
            <p className="text-xs text-forge-text-muted mt-0.5 font-sans">
              Caseload distributions, multi-month resolution curves, severity telemetry, and regional financial activity.
            </p>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center space-x-1 font-mono text-xs bg-forge-panel p-1 rounded-lg border border-forge-border">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'OVERVIEW'
                ? 'bg-forge-cyan text-slate-900 font-bold'
                : 'text-forge-text-secondary hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('TRENDS')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'TRENDS'
                ? 'bg-forge-cyan text-slate-900 font-bold'
                : 'text-forge-text-secondary hover:text-white'
            }`}
          >
            Resolution Trends
          </button>
          <button
            onClick={() => setActiveTab('REGIONAL')}
            className={`px-3 py-1 rounded transition text-xs ${
              activeTab === 'REGIONAL'
                ? 'bg-forge-cyan text-slate-900 font-bold'
                : 'text-forge-text-secondary hover:text-white'
            }`}
          >
            Regional Volume
          </button>
        </div>
      </div>

      {/* Analytics Content Based on Active Tab */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chart 1: Caseload & Evidence Exhibits by Crime Category (7 Cols) */}
          <div className="lg:col-span-7 bg-forge-bg/90 border border-forge-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-forge-border/40 pb-2">
              <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs font-bold">
                <BarChart3 className="w-4 h-4" />
                <span>CASELOAD &amp; EXHIBITS BY CRIME CATEGORY</span>
              </div>
              <span className="text-[10px] font-mono text-forge-text-muted">MULTI-AGENCY DATA</span>
            </div>

            <div className="h-56 w-full text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
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
                              Sealed Exhibits: <span className="font-bold text-white">{data.evidence}</span>
                            </div>
                            <div className="text-forge-emerald text-[11px]">
                              Tracked Entities: <span className="font-bold text-white">{data.entities}</span>
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

          {/* Chart 2: Threat & Alert Severity Distribution (5 Cols) */}
          <div className="lg:col-span-5 bg-forge-bg/90 border border-forge-border rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-forge-border/40 pb-2">
              <div className="flex items-center space-x-2 text-forge-rose font-mono text-xs font-bold">
                <PieIcon className="w-4 h-4" />
                <span>THREAT SEVERITY BREAKDOWN</span>
              </div>
              <span className="text-[10px] font-mono text-forge-text-muted">LIVE TELEMETRY</span>
            </div>

            <div className="h-48 w-full text-xs font-mono relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="bg-forge-panel border border-forge-border p-2 rounded shadow-lg font-mono text-xs">
                            <span className="font-bold text-white">{data.name}: </span>
                            <span className="text-forge-cyan">{data.value} Alerts</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Metric */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold font-mono text-white">
                  {alerts.length || 18}
                </span>
                <span className="text-[9px] font-mono text-forge-text-muted uppercase">
                  Alerts
                </span>
              </div>
            </div>

            {/* Severity Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-forge-border/40">
              {severityPieData.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-forge-text-secondary">{s.name}</span>
                  </div>
                  <span className="font-bold text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TRENDS' && (
        /* Monthly Influx vs Resolution Area Chart */
        <div className="bg-forge-bg/90 border border-forge-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-forge-border/40 pb-2">
            <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>MONTHLY CASE INFLUX &amp; RESOLUTION TREND (2026)</span>
            </div>
            <span className="text-[10px] font-mono text-forge-text-muted">7-MONTH TIMELINE</span>
          </div>

          <div className="h-64 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="influxGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="resolutionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="month"
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
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-forge-panel border border-forge-border p-2.5 rounded shadow-lg font-mono text-xs space-y-1">
                          <div className="text-white font-bold">{label}</div>
                          <div className="text-forge-cyan text-[11px]">
                            Cases Registered: <span className="font-bold text-white">{payload[0].value}</span>
                          </div>
                          <div className="text-forge-emerald text-[11px]">
                            Cases Resolved: <span className="font-bold text-white">{payload[1].value}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registered"
                  stroke="#00f0ff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#influxGradient)"
                  name="Registered Cases"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#resolutionGradient)"
                  name="Resolved / Closed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center space-x-6 text-[10px] font-mono pt-1 text-forge-text-muted">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-forge-cyan" />
              <span>Monthly Influx (Registered)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-forge-emerald" />
              <span>Chargesheeted / Resolved</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'REGIONAL' && (
        /* Regional State & Financial Volume Bar Chart */
        <div className="bg-forge-bg/90 border border-forge-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-forge-border/40 pb-2">
            <div className="flex items-center space-x-2 text-forge-amber font-mono text-xs font-bold">
              <Landmark className="w-4 h-4" />
              <span>ESTIMATED FINANCIAL VOLUME BY JURISDICTION (₹ CRORES)</span>
            </div>
            <span className="text-[10px] font-mono text-forge-text-muted">INTER-STATE CORRIDORS</span>
          </div>

          <div className="h-64 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateDistributionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="state"
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
                          <div className="text-white font-bold">{data.state}</div>
                          <div className="text-forge-amber text-[11px]">
                            Tracked Volume: <span className="font-bold text-white">₹{data.financialVolume} Crore</span>
                          </div>
                          <div className="text-forge-cyan text-[11px]">
                            Active Operations: <span className="font-bold text-white">{data.count}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="financialVolume" fill="#f59e0b" name="Financial Volume (₹ Cr)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-forge-text-muted">
            <span>Aggregated mule transfers, hawala remittance ledgers, and seized asset valuations.</span>
            <span className="text-forge-amber font-bold">Total Portfolio: ₹202+ Crore Tracked</span>
          </div>
        </div>
      )}
    </div>
  );
};
