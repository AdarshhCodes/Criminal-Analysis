import React, { useState, useMemo } from 'react';
import {
  MapPin,
  AlertTriangle,
  HeartHandshake,
  Landmark,
  ArrowRight,
  RotateCcw,
  Activity,
  Globe2,
} from 'lucide-react';
import { Case } from '../../types';
import { SeverityBadge, CaseStatusBadge } from '../common/SeverityBadge';

interface IndiaCrimeMapProps {
  cases: Case[];
  selectedState: string | null;
  onSelectState: (state: string | null) => void;
  onSelectCase: (caseId: string) => void;
}

// Tactical incident hubs mapped to approximate normalized percentage coordinates [x, y] on India SVG projection
interface IncidentHub {
  id: string;
  name: string;
  city: string;
  state: string;
  coords: { x: number; y: number }; // percentage on 0-100 scale
  caseId: string;
  caseCode: string;
  caseName: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  isWomenRelated: boolean;
  activityNote: string;
  threatLevel: number;
}

const TACTICAL_HUBS: IncidentHub[] = [
  {
    id: 'HUB-DELHI',
    name: 'National Capital Cyber Operations Hub',
    city: 'New Delhi',
    state: 'Delhi',
    coords: { x: 38, y: 31 },
    caseId: 'IF-CASE-2026-0882',
    caseCode: 'IF-2026-0882',
    caseName: 'Operation Falcon',
    priority: 'CRITICAL',
    category: 'Financial Hawala & SIM Farm',
    isWomenRelated: false,
    activityNote: 'Okhla Warehouse & Karol Bagh Bullion corridor',
    threatLevel: 98,
  },
  {
    id: 'HUB-ROHINI',
    name: 'Rohini Cyber Crime Special Sector',
    city: 'New Delhi',
    state: 'Delhi',
    coords: { x: 39, y: 29 },
    caseId: 'IF-CASE-2026-0741',
    caseCode: 'IF-2026-0741',
    caseName: 'Operation Rakshak',
    priority: 'CRITICAL',
    category: 'Women-Related Cyber Crime',
    isWomenRelated: true,
    activityNote: 'VoIP gateway intercepts & safehouse surveillance',
    threatLevel: 96,
  },
  {
    id: 'HUB-NOIDA',
    name: 'Sector 62 FinTech Fraud Grid',
    city: 'Noida',
    state: 'Uttar Pradesh',
    coords: { x: 42, y: 33 },
    caseId: 'IF-CASE-2026-0519',
    caseCode: 'IF-2026-0519',
    caseName: 'Operation Chimera',
    priority: 'HIGH',
    category: 'Synthetic Identity Lending',
    isWomenRelated: false,
    activityNote: '1,200+ illegal loan apps backend server farm',
    threatLevel: 89,
  },
  {
    id: 'HUB-MUMBAI',
    name: 'JNPT Maritime & Offshore Interdiction Cell',
    city: 'Mumbai',
    state: 'Maharashtra',
    coords: { x: 26, y: 61 },
    caseId: 'IF-CASE-2026-0310',
    caseCode: 'IF-2026-0310',
    caseName: 'Operation DarkVessel',
    priority: 'CRITICAL',
    category: 'Maritime Smuggling & Narcotics',
    isWomenRelated: false,
    activityNote: 'Container customs seizure & Arabian Sea surveillance',
    threatLevel: 94,
  },
  {
    id: 'HUB-BLR',
    name: 'Electronic City Anti-Harassment Grid',
    city: 'Bengaluru',
    state: 'Karnataka',
    coords: { x: 38, y: 81 },
    caseId: 'IF-CASE-2026-0923',
    caseCode: 'IF-2026-0923',
    caseName: 'Operation Trishul',
    priority: 'CRITICAL',
    category: 'Women-Related Cyber Extortion',
    isWomenRelated: true,
    activityNote: 'Cross-state call center raid & UPI sweep monitoring',
    threatLevel: 93,
  },
  {
    id: 'HUB-KOLKATA',
    name: 'Burrabazar Bullion & Transit Corridor',
    city: 'Kolkata',
    state: 'West Bengal',
    coords: { x: 74, y: 49 },
    caseId: 'IF-CASE-2026-0612',
    caseCode: 'IF-2026-0612',
    caseName: 'Operation JalTarang',
    priority: 'HIGH',
    category: 'Bullion Hawala & Border Smuggling',
    isWomenRelated: false,
    activityNote: 'Cross-border currency exchange & shell trade',
    threatLevel: 90,
  },
  {
    id: 'HUB-HYD',
    name: 'Cyberabad Financial Taskforce Post',
    city: 'Hyderabad',
    state: 'Telangana',
    coords: { x: 44, y: 67 },
    caseId: 'IF-CASE-2026-0923',
    caseCode: 'IF-2026-0923',
    caseName: 'Operation Trishul',
    priority: 'HIGH',
    category: 'Mule Sweep Gateway',
    isWomenRelated: true,
    activityNote: 'Secondary call center relay & IP node',
    threatLevel: 82,
  },
];

// Simplified geographic polygons representing Indian States on a standard 0-100 coordinate viewBox
interface StatePolygon {
  name: string;
  path: string;
  center: { x: number; y: number };
}

const INDIA_STATES_DATA: StatePolygon[] = [
  {
    name: 'Jammu & Kashmir / Ladakh',
    path: 'M 32 6 L 44 4 L 54 11 L 49 19 L 36 21 L 28 17 Z',
    center: { x: 40, y: 12 },
  },
  {
    name: 'Punjab',
    path: 'M 28 21 L 36 21 L 37 28 L 29 27 Z',
    center: { x: 33, y: 24 },
  },
  {
    name: 'Himachal Pradesh',
    path: 'M 36 19 L 46 18 L 47 25 L 37 24 Z',
    center: { x: 41, y: 22 },
  },
  {
    name: 'Uttarakhand',
    path: 'M 43 23 L 52 23 L 50 30 L 42 28 Z',
    center: { x: 46, y: 26 },
  },
  {
    name: 'Haryana',
    path: 'M 33 26 L 41 26 L 41 33 L 34 32 Z',
    center: { x: 37, y: 29 },
  },
  {
    name: 'Delhi',
    path: 'M 38 29 L 41 29 L 41 32 L 38 32 Z',
    center: { x: 39.5, y: 30.5 },
  },
  {
    name: 'Rajasthan',
    path: 'M 16 28 L 33 26 L 37 36 L 27 49 L 14 42 Z',
    center: { x: 25, y: 36 },
  },
  {
    name: 'Uttar Pradesh',
    path: 'M 39 30 L 52 29 L 64 36 L 56 46 L 42 41 L 39 33 Z',
    center: { x: 49, y: 36 },
  },
  {
    name: 'Bihar',
    path: 'M 60 36 L 73 37 L 72 44 L 59 44 Z',
    center: { x: 66, y: 40 },
  },
  {
    name: 'West Bengal',
    path: 'M 72 38 L 78 40 L 76 56 L 70 53 L 73 44 Z',
    center: { x: 74, y: 48 },
  },
  {
    name: 'Assam & Northeast',
    path: 'M 78 37 L 96 33 L 95 46 L 82 48 L 78 42 Z',
    center: { x: 86, y: 40 },
  },
  {
    name: 'Gujarat',
    path: 'M 8 43 L 23 44 L 27 57 L 17 61 L 8 52 Z',
    center: { x: 17, y: 51 },
  },
  {
    name: 'Madhya Pradesh',
    path: 'M 28 42 L 53 43 L 56 55 L 34 56 L 27 48 Z',
    center: { x: 41, y: 48 },
  },
  {
    name: 'Jharkhand',
    path: 'M 59 44 L 69 44 L 68 53 L 57 52 Z',
    center: { x: 63, y: 48 },
  },
  {
    name: 'Odisha',
    path: 'M 58 52 L 71 52 L 67 65 L 56 61 Z',
    center: { x: 63, y: 58 },
  },
  {
    name: 'Maharashtra',
    path: 'M 19 57 L 38 56 L 47 62 L 40 73 L 21 68 Z',
    center: { x: 31, y: 64 },
  },
  {
    name: 'Telangana',
    path: 'M 39 63 L 51 63 L 49 73 L 40 71 Z',
    center: { x: 44, y: 67 },
  },
  {
    name: 'Andhra Pradesh',
    path: 'M 45 68 L 57 65 L 53 82 L 43 81 Z',
    center: { x: 49, y: 74 },
  },
  {
    name: 'Karnataka',
    path: 'M 26 69 L 41 71 L 43 85 L 31 87 L 27 77 Z',
    center: { x: 35, y: 78 },
  },
  {
    name: 'Goa',
    path: 'M 25 76 L 27 76 L 26 79 L 24 79 Z',
    center: { x: 25.5, y: 77.5 },
  },
  {
    name: 'Kerala',
    path: 'M 32 86 L 38 86 L 36 97 L 31 94 Z',
    center: { x: 34, y: 91 },
  },
  {
    name: 'Tamil Nadu',
    path: 'M 38 83 L 49 81 L 43 97 L 36 96 Z',
    center: { x: 43, y: 89 },
  },
];

export const IndiaCrimeMap: React.FC<IndiaCrimeMapProps> = ({
  cases,
  selectedState,
  onSelectState,
  onSelectCase,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL' | 'WOMEN' | 'FINANCIAL'>('ALL');
  const [hoveredHub, setHoveredHub] = useState<IncidentHub | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Group cases by state for density calculations
  const stateCaseMap = useMemo(() => {
    const map: Record<string, { count: number; critical: boolean; women: boolean; cases: Case[] }> = {};
    cases.forEach((c) => {
      const st = c.state || 'Delhi';
      if (!map[st]) {
        map[st] = { count: 0, critical: false, women: false, cases: [] };
      }
      map[st].count += 1;
      if (c.priority === 'CRITICAL') map[st].critical = true;
      if (c.caseFlags?.includes('WOMEN_RELATED')) map[st].women = true;
      map[st].cases.push(c);
    });
    return map;
  }, [cases]);

  // Filter hubs according to active mode
  const filteredHubs = useMemo(() => {
    return TACTICAL_HUBS.filter((hub) => {
      if (filterMode === 'CRITICAL') return hub.priority === 'CRITICAL';
      if (filterMode === 'WOMEN') return hub.isWomenRelated;
      if (filterMode === 'FINANCIAL') return hub.category.toLowerCase().includes('hawala') || hub.category.toLowerCase().includes('lending');
      return true;
    });
  }, [filterMode]);

  // State color mapping based on concentration and selection
  const getStateFill = (stateName: string) => {
    const isSelected = selectedState && selectedState.toLowerCase() === stateName.toLowerCase();
    const data = stateCaseMap[stateName];

    if (isSelected) {
      return '#00f0ff'; // forge-cyan highlight
    }

    if (!data || data.count === 0) {
      return '#0f172a'; // slate-900 subtle
    }

    if (data.women && filterMode === 'WOMEN') {
      return '#881337'; // deep rose
    }

    if (data.critical) {
      return '#4c0519'; // deep rose-wine
    }

    if (data.count >= 2) {
      return '#083344'; // deep cyan
    }

    return '#1e293b'; // slate-800
  };

  const getStateStroke = (stateName: string) => {
    const isSelected = selectedState && selectedState.toLowerCase() === stateName.toLowerCase();
    if (isSelected) return '#38bdf8';
    if (hoveredState === stateName) return '#00f0ff';
    const data = stateCaseMap[stateName];
    if (data?.critical) return '#f43f5e';
    if (data?.count) return '#06b6d4';
    return '#334155';
  };

  const activeCasesInSelectedState = useMemo(() => {
    if (!selectedState) return [];
    return cases.filter(
      (c) => c.state?.toLowerCase() === selectedState.toLowerCase() || c.location?.toLowerCase().includes(selectedState.toLowerCase())
    );
  }, [cases, selectedState]);

  return (
    <div className="bg-forge-card border border-forge-border rounded-xl p-5 space-y-4 shadow-xl select-none">
      {/* Map Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-forge-border/60 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30 shadow-sm">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight font-sans">
                National Operational Surveillance Map
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40 font-bold uppercase">
                India Tactical Grid
              </span>
            </div>
            <p className="text-xs text-forge-text-muted mt-0.5 font-sans">
              Inter-state criminal network intelligence, tactical incident hubs, and jurisdiction crime concentration.
            </p>
          </div>
        </div>

        {/* Tactical Filter Mode Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-2.5 py-1 rounded transition flex items-center space-x-1 ${
              filterMode === 'ALL'
                ? 'bg-forge-cyan text-slate-900 font-bold shadow-cyan-glow'
                : 'bg-forge-panel text-forge-text-secondary hover:text-white border border-forge-border'
            }`}
          >
            <span>All Hubs</span>
          </button>
          <button
            onClick={() => setFilterMode('CRITICAL')}
            className={`px-2.5 py-1 rounded transition flex items-center space-x-1 ${
              filterMode === 'CRITICAL'
                ? 'bg-forge-rose text-white font-bold shadow-md'
                : 'bg-forge-panel text-forge-text-secondary hover:text-white border border-forge-border'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Critical Only</span>
          </button>
          <button
            onClick={() => setFilterMode('WOMEN')}
            className={`px-2.5 py-1 rounded transition flex items-center space-x-1 ${
              filterMode === 'WOMEN'
                ? 'bg-rose-500/30 text-rose-300 font-bold border border-rose-500'
                : 'bg-forge-panel text-forge-text-secondary hover:text-white border border-forge-border'
            }`}
          >
            <HeartHandshake className="w-3 h-3 text-rose-400" />
            <span>Women-Safety</span>
          </button>
          <button
            onClick={() => setFilterMode('FINANCIAL')}
            className={`px-2.5 py-1 rounded transition flex items-center space-x-1 ${
              filterMode === 'FINANCIAL'
                ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500'
                : 'bg-forge-panel text-forge-text-secondary hover:text-white border border-forge-border'
            }`}
          >
            <Landmark className="w-3 h-3" />
            <span>Hawala Trails</span>
          </button>

          {selectedState && (
            <button
              onClick={() => onSelectState(null)}
              className="px-2 py-1 rounded bg-forge-card hover:bg-forge-panel border border-forge-border text-forge-text-muted hover:text-white flex items-center space-x-1"
              title="Clear State Filter"
            >
              <RotateCcw className="w-3 h-3 text-forge-amber" />
              <span>Reset State</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map Body: 2-Column Responsive Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive Vector Map Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-forge-bg/90 border border-forge-border rounded-xl p-4 relative overflow-hidden flex flex-col items-center">
          {/* Subtle Grid Watermark Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* SVG Map Container */}
          <div className="w-full max-w-[480px] aspect-[4/5] relative">
            <svg
              viewBox="0 0 100 105"
              className="w-full h-full filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
            >
              {/* Transit Corridor Curved Lines (Inter-State Linkages) */}
              <g className="opacity-40 stroke-forge-cyan stroke-[0.8] fill-none stroke-dasharray-[2_2]">
                {/* Delhi to Mumbai Hawala Flow */}
                <path d="M 39 30 Q 30 45 26 61" className="animate-pulse" />
                {/* Delhi to Bengaluru Telecom Loop */}
                <path d="M 39 30 Q 42 55 38 81" />
                {/* Kolkata to Delhi Bullion Trail */}
                <path d="M 74 49 Q 55 38 39 30" />
                {/* Mumbai to Bengaluru Inter-branch Line */}
                <path d="M 26 61 Q 30 72 38 81" />
              </g>

              {/* State Polygons */}
              {INDIA_STATES_DATA.map((state) => {
                const isSelected = selectedState?.toLowerCase() === state.name.toLowerCase();
                const isHovered = hoveredState === state.name;
                const caseInfo = stateCaseMap[state.name];

                return (
                  <path
                    key={state.name}
                    d={state.path}
                    fill={getStateFill(state.name)}
                    stroke={getStateStroke(state.name)}
                    strokeWidth={isSelected ? 1.4 : isHovered ? 1.0 : 0.6}
                    className="cursor-pointer transition-all duration-200 hover:brightness-125"
                    onClick={() => {
                      if (isSelected) {
                        onSelectState(null);
                      } else {
                        onSelectState(state.name);
                      }
                    }}
                    onMouseEnter={() => setHoveredState(state.name)}
                    onMouseLeave={() => setHoveredState(null)}
                  >
                    <title>{`${state.name} — ${caseInfo ? caseInfo.count : 0} active operations`}</title>
                  </path>
                );
              })}

              {/* Tactical Incident Hub Pins */}
              {filteredHubs.map((hub) => {
                const isHovered = hoveredHub?.id === hub.id;
                const isCritical = hub.priority === 'CRITICAL';

                return (
                  <g
                    key={hub.id}
                    transform={`translate(${hub.coords.x}, ${hub.coords.y})`}
                    className="cursor-pointer group"
                    onClick={() => {
                      onSelectState(hub.state);
                      onSelectCase(hub.caseId);
                    }}
                    onMouseEnter={() => setHoveredHub(hub)}
                    onMouseLeave={() => setHoveredHub(null)}
                  >
                    {/* Pulsing Radar Ring for Critical Hubs */}
                    {isCritical && (
                      <circle
                        r="3.5"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="0.5"
                        className="animate-ping opacity-75"
                      />
                    )}

                    {/* Outer Glow Halo */}
                    <circle
                      r={isHovered ? 3.0 : 2.2}
                      fill={hub.isWomenRelated ? '#f43f5e' : isCritical ? '#f59e0b' : '#00f0ff'}
                      fillOpacity={isHovered ? 0.9 : 0.7}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 0.8 : 0.4}
                    />

                    {/* Central Pin Dot */}
                    <circle r="0.8" fill="#ffffff" />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay for Hubs */}
            {hoveredHub && (
              <div
                className="absolute z-20 pointer-events-none bg-forge-panel border border-forge-cyan p-2.5 rounded-lg shadow-2xl font-mono text-xs space-y-1 w-52 transition -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${hoveredHub.coords.x}%`,
                  top: `${hoveredHub.coords.y - 4}%`,
                }}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-forge-cyan">{hoveredHub.city}</span>
                  <SeverityBadge level={hoveredHub.priority} size="xs" />
                </div>
                <div className="text-white font-bold text-[11px] leading-tight font-sans">
                  {hoveredHub.caseName}
                </div>
                <div className="text-[10px] text-forge-text-muted">{hoveredHub.category}</div>
                <p className="text-[10px] text-forge-text-secondary leading-tight pt-1 border-t border-forge-border/40">
                  {hubActivitySummary(hoveredHub)}
                </p>
              </div>
            )}
          </div>

          {/* Map Bottom Legend */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-forge-border/60 text-[10px] font-mono text-forge-text-muted mt-2">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-forge-rose animate-pulse" />
                <span>Critical / Women-Safety Hub</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-forge-amber" />
                <span>Financial / Cyber Grid</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-forge-cyan" />
                <span>Transit Nodes</span>
              </span>
            </div>
            <span className="text-[9px] text-forge-cyan">CLICK STATE OR PIN TO FILTER</span>
          </div>
        </div>

        {/* Right Column: State Operations & Region Telemetry (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active State Telemetry Card */}
          <div className="bg-forge-bg rounded-xl border border-forge-border p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-forge-border/60 pb-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-forge-cyan" />
                <span className="font-bold text-white text-xs font-mono uppercase">
                  {selectedState ? `${selectedState} Operations` : 'Pan-India Operations View'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-forge-cyan font-bold">
                {selectedState
                  ? `${activeCasesInSelectedState.length} Active in State`
                  : `${cases.length} Total Operations`}
              </span>
            </div>

            {selectedState ? (
              <div className="space-y-2.5">
                <p className="text-xs text-forge-text-secondary leading-relaxed">
                  Showing cases indexed within <span className="text-white font-bold">{selectedState}</span>.
                  Click any case to inspect its operational dossier and connection graph.
                </p>

                {activeCasesInSelectedState.length > 0 ? (
                  <div className="space-y-2">
                    {activeCasesInSelectedState.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => onSelectCase(c.id)}
                        className="p-3 rounded-lg bg-forge-card border border-forge-border hover:border-forge-cyan transition cursor-pointer space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-forge-cyan">
                            {c.code}
                          </span>
                          <div className="flex items-center space-x-1">
                            <CaseStatusBadge status={c.status} size="xs" />
                            <SeverityBadge level={c.priority} size="xs" />
                          </div>
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-forge-cyan transition leading-snug">
                          {c.name}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] font-mono text-forge-text-muted pt-1">
                          <span>{c.location}</span>
                          <span className="text-forge-cyan flex items-center space-x-0.5">
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-forge-text-muted font-mono bg-forge-card rounded border border-dashed border-forge-border">
                    No active cases currently registered in this state jurisdiction.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-forge-text-secondary leading-relaxed">
                  Click on any state boundary on the map to filter cases by jurisdiction, or select a
                  key incident hub below:
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(stateCaseMap).map(([stName, data]) => (
                    <button
                      key={stName}
                      onClick={() => onSelectState(stName)}
                      className="p-2.5 rounded bg-forge-card border border-forge-border hover:border-forge-cyan/50 text-left transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-[11px] truncate">{stName}</span>
                        <span className="px-1.5 py-0.2 rounded bg-forge-cyan/15 text-forge-cyan font-bold text-[10px]">
                          {data.count}
                        </span>
                      </div>
                      <span className="text-[10px] text-forge-text-muted truncate mt-1">
                        {data.critical ? 'High-Risk Priority' : 'Active Surveillance'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* National Inter-State Surveillance Summary */}
          <div className="p-3.5 bg-forge-bg rounded-xl border border-forge-border space-y-2 font-mono text-xs">
            <div className="text-[10px] text-forge-text-muted uppercase flex items-center justify-between">
              <span>INTER-STATE SYNDICATE CORRIDORS</span>
              <Activity className="w-3.5 h-3.5 text-forge-emerald" />
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-forge-text-secondary">
                <span>Delhi ⇄ Mumbai Commercial:</span>
                <span className="text-forge-rose font-bold">₹112 Cr Transit Flow</span>
              </div>
              <div className="flex items-center justify-between text-forge-text-secondary">
                <span>Delhi ⇄ Bengaluru Cyber:</span>
                <span className="text-forge-amber font-bold">14 Intercepted VoIP Hubs</span>
              </div>
              <div className="flex items-center justify-between text-forge-text-secondary">
                <span>Kolkata ⇄ Northeast Bullion:</span>
                <span className="text-forge-cyan font-bold">Active Customs Surveillance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function hubActivitySummary(hub: IncidentHub): string {
  return hub.activityNote;
}
