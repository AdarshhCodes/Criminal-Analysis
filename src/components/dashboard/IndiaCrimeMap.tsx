import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { GeoPermissibleObjects } from 'd3-geo';
import {
  MapPin, AlertTriangle, HeartHandshake, Landmark,
  ArrowRight, RotateCcw, Activity, Globe2,
} from 'lucide-react';
import { Case } from '../../types';
import { SeverityBadge, CaseStatusBadge } from '../common/SeverityBadge';
// GeoJSON bundled at build time — no HTTP fetch, works 100% offline
import indiaGeoJson from '../../data/geo/india-states.json';

// ─── SVG canvas size (pure SVG viewport) ────────────────────────────────────
const SVG_W = 520;
const SVG_H = 620;

// ─── Mercator projection fixed to India ─────────────────────────────────────
const projection = geoMercator()
  .center([82.5, 22.5])   // India's geographic centre
  .scale(900)              // zoom level — covers all of India inside SVG_W×SVG_H
  .translate([SVG_W / 2, SVG_H / 2]);

const pathGen = geoPath().projection(projection);

// ─── Types ───────────────────────────────────────────────────────────────────
interface IndiaCrimeMapProps {
  cases: Case[];
  selectedState: string | null;
  onSelectState: (state: string | null) => void;
  onSelectCase: (caseId: string) => void;
}

interface IncidentHub {
  id: string;
  city: string;
  state: string;
  lng: number;
  lat: number;
  caseId: string;
  caseName: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  isWomenRelated: boolean;
  activityNote: string;
  threatLevel: number;
}

interface Corridor {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  value: string;
  color: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const HUBS: IncidentHub[] = [
  { id: 'DEL',  city: 'New Delhi',  state: 'Delhi',        lng: 77.209,   lat: 28.6139, caseId: 'IF-CASE-2026-0882', caseName: 'Operation Falcon',     priority: 'CRITICAL', category: 'Financial Hawala & SIM Farm',     isWomenRelated: false, activityNote: 'Okhla Warehouse & Karol Bagh Bullion corridor',          threatLevel: 98 },
  { id: 'ROH',  city: 'New Delhi',  state: 'Delhi',        lng: 77.0855,  lat: 28.7495, caseId: 'IF-CASE-2026-0741', caseName: 'Operation Rakshak',     priority: 'CRITICAL', category: 'Women-Related Cyber Crime',       isWomenRelated: true,  activityNote: 'VoIP gateway intercepts & safehouse surveillance',         threatLevel: 96 },
  { id: 'NOI',  city: 'Noida',      state: 'Uttar Pradesh',lng: 77.391,   lat: 28.5355, caseId: 'IF-CASE-2026-0519', caseName: 'Operation Chimera',     priority: 'HIGH',     category: 'Synthetic Identity Lending',     isWomenRelated: false, activityNote: '1,200+ illegal loan apps backend server farm',             threatLevel: 89 },
  { id: 'MUM',  city: 'Mumbai',     state: 'Maharashtra',  lng: 72.8777,  lat: 19.0760, caseId: 'IF-CASE-2026-0310', caseName: 'Operation DarkVessel',  priority: 'CRITICAL', category: 'Maritime Smuggling & Narcotics', isWomenRelated: false, activityNote: 'Container customs seizure & Arabian Sea surveillance',     threatLevel: 94 },
  { id: 'BLR',  city: 'Bengaluru',  state: 'Karnataka',    lng: 77.5946,  lat: 12.9716, caseId: 'IF-CASE-2026-0923', caseName: 'Operation Trishul',     priority: 'CRITICAL', category: 'Women-Related Cyber Extortion',  isWomenRelated: true,  activityNote: 'Cross-state call center raid & UPI sweep monitoring',      threatLevel: 93 },
  { id: 'KOL',  city: 'Kolkata',    state: 'West Bengal',  lng: 88.3639,  lat: 22.5726, caseId: 'IF-CASE-2026-0612', caseName: 'Operation JalTarang',   priority: 'HIGH',     category: 'Bullion Hawala & Border Smuggling',isWomenRelated:false, activityNote: 'Cross-border currency exchange & shell trade',            threatLevel: 90 },
  { id: 'HYD',  city: 'Hyderabad',  state: 'Andhra Pradesh',lng:78.4867,  lat: 17.3850, caseId: 'IF-CASE-2026-0923', caseName: 'Operation Trishul',     priority: 'HIGH',     category: 'Mule Sweep Gateway',             isWomenRelated: true,  activityNote: 'Secondary call center relay & IP node',                    threatLevel: 82 },
];

const CORRIDORS: Corridor[] = [
  { id: 'C1', fromId: 'DEL', toId: 'MUM', label: 'Delhi ⇄ Mumbai Commercial',      value: '₹112 Cr Transit Flow',        color: '#f43f5e' },
  { id: 'C2', fromId: 'DEL', toId: 'BLR', label: 'Delhi ⇄ Bengaluru Cyber',         value: '14 Intercepted VoIP Hubs',    color: '#f59e0b' },
  { id: 'C3', fromId: 'KOL', toId: 'DEL', label: 'Kolkata ⇄ Northeast Bullion',     value: 'Active Customs Surveillance', color: '#00f0ff' },
  { id: 'C4', fromId: 'MUM', toId: 'BLR', label: 'Mumbai ⇄ Bengaluru Inter-branch', value: 'Shell Co Financial Relay',    color: '#a78bfa' },
];

// GeoJSON NAME_1 → our app state name
const GEO_NAME_MAP: Record<string, string> = {
  'Delhi': 'Delhi', 'Maharashtra': 'Maharashtra', 'Karnataka': 'Karnataka',
  'West Bengal': 'West Bengal', 'Uttar Pradesh': 'Uttar Pradesh',
  'Andhra Pradesh': 'Andhra Pradesh', 'Gujarat': 'Gujarat', 'Rajasthan': 'Rajasthan',
  'Madhya Pradesh': 'Madhya Pradesh', 'Tamil Nadu': 'Tamil Nadu', 'Bihar': 'Bihar',
  'Haryana': 'Haryana', 'Punjab': 'Punjab', 'Jharkhand': 'Jharkhand',
  'Orissa': 'Odisha', 'Odisha': 'Odisha', 'Kerala': 'Kerala', 'Assam': 'Assam',
  'Jammu and Kashmir': 'Jammu & Kashmir', 'Himachal Pradesh': 'Himachal Pradesh',
  'Uttaranchal': 'Uttarakhand', 'Goa': 'Goa', 'Chhattisgarh': 'Chhattisgarh',
  'Chandigarh': 'Punjab', 'Telangana': 'Telangana',
  'Sikkim': 'Sikkim', 'Manipur': 'Manipur', 'Meghalaya': 'Meghalaya',
  'Mizoram': 'Mizoram', 'Nagaland': 'Nagaland', 'Tripura': 'Tripura',
  'Arunachal Pradesh': 'Arunachal Pradesh',
  'Andaman and Nicobar': 'Andaman & Nicobar', 'Lakshadweep': 'Lakshadweep',
  'Dadra and Nagar Haveli': 'Dadra & NH', 'Daman and Diu': 'Daman & Diu',
  'Puducherry': 'Puducherry',
};

type FilterKey = 'ALL' | 'CRITICAL' | 'WOMEN' | 'FINANCIAL';

// ─── Colour helpers ───────────────────────────────────────────────────────────
function hubColor(hub: IncidentHub) {
  if (hub.isWomenRelated)           return '#f43f5e';
  if (hub.priority === 'CRITICAL')  return '#f59e0b';
  return '#00f0ff';
}

function stateFill(
  appName: string,
  caseMap: Record<string, { count: number; critical: boolean; women: boolean }>,
  selected: string | null,
  hovered: string | null,
  filter: FilterKey,
): string {
  if (selected === appName) return '#0e7490'; // bright teal — selected
  if (hovered  === appName) return '#164e63'; // lighter teal — hovered
  const d = caseMap[appName];
  if (!d)         return '#1a2744';           // dark navy — no cases
  if (d.women && filter === 'WOMEN') return '#9f1239'; // rose — women filter
  if (d.critical) return '#7c2d12';           // amber-red — critical
  if (d.count >= 2) return '#155e75';         // teal — multi-case
  return '#1e3a5f';                           // mid blue — single case
}

function stateStroke(
  appName: string,
  caseMap: Record<string, { count: number; critical: boolean; women: boolean }>,
  selected: string | null,
  hovered: string | null,
): string {
  if (selected === appName) return '#38bdf8';
  if (hovered  === appName) return '#7dd3fc';
  const d = caseMap[appName];
  if (d?.critical) return '#fb923c';
  if (d?.count)    return '#22d3ee';
  return '#334155'; // always-visible slate border
}

// ─── Component ────────────────────────────────────────────────────────────────
export const IndiaCrimeMap: React.FC<IndiaCrimeMapProps> = ({
  cases, selectedState, onSelectState, onSelectCase,
}) => {
  const [filter, setFilter]           = useState<FilterKey>('ALL');
  const [hoveredHub, setHoveredHub]   = useState<IncidentHub | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [animTick, setAnimTick]       = useState(0);
  const [tooltip, setTooltip]         = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Corridor dash animation
  useEffect(() => {
    const id = setInterval(() => setAnimTick(t => (t + 1) % 300), 55);
    return () => clearInterval(id);
  }, []);

  // Cases grouped by state
  const caseMap = useMemo(() => {
    const m: Record<string, { count: number; critical: boolean; women: boolean; cases: Case[] }> = {};
    cases.forEach(c => {
      const st = c.state ?? 'Delhi';
      if (!m[st]) m[st] = { count: 0, critical: false, women: false, cases: [] };
      m[st].count++;
      if (c.priority === 'CRITICAL') m[st].critical = true;
      if (c.caseFlags?.includes('WOMEN_RELATED')) m[st].women = true;
      m[st].cases.push(c);
    });
    return m;
  }, [cases]);

  const filteredHubs = useMemo(() => HUBS.filter(h => {
    if (filter === 'CRITICAL')  return h.priority === 'CRITICAL';
    if (filter === 'WOMEN')     return h.isWomenRelated;
    if (filter === 'FINANCIAL') return h.category.toLowerCase().includes('hawala') || h.category.toLowerCase().includes('lending');
    return true;
  }), [filter]);

  const activeCases = useMemo(() => {
    if (!selectedState) return [];
    return cases.filter(c =>
      c.state?.toLowerCase() === selectedState.toLowerCase() ||
      c.location?.toLowerCase().includes(selectedState.toLowerCase())
    );
  }, [cases, selectedState]);

  // Project a [lng, lat] → [svgX, svgY]
  const project = useCallback((lng: number, lat: number): [number, number] => {
    const pt = projection([lng, lat]);
    return pt ?? [0, 0];
  }, []);

  // Build corridor bezier path string
  const corridorPath = useCallback((from: IncidentHub, to: IncidentHub): string => {
    const [x1, y1] = project(from.lng, from.lat);
    const [x2, y2] = project(to.lng, to.lat);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const cx = mx + (dy / len) * (len * 0.25);
    const cy = my - (dx / len) * (len * 0.25);
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  }, [project]);

  // Handle mouse move on SVG to position tooltips
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="bg-forge-card border border-forge-border rounded-xl p-5 space-y-4 shadow-xl select-none">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-forge-border/60 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">National Operational Surveillance Map</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40 font-bold uppercase">India Tactical Grid</span>
            </div>
            <p className="text-xs text-forge-text-muted mt-0.5">Inter-state criminal network intelligence, tactical incident hubs, and jurisdiction crime concentration.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {([
            { k: 'ALL',       label: 'All Hubs',      icon: null },
            { k: 'CRITICAL',  label: 'Critical Only', icon: <AlertTriangle className="w-3 h-3" /> },
            { k: 'WOMEN',     label: 'Women-Safety',  icon: <HeartHandshake className="w-3 h-3 text-rose-400" /> },
            { k: 'FINANCIAL', label: 'Hawala Trails', icon: <Landmark className="w-3 h-3" /> },
          ] as const).map(({ k, label, icon }) => (
            <button
              key={k}
              onClick={() => setFilter(k as FilterKey)}
              className={`px-2.5 py-1 rounded transition flex items-center space-x-1 ${
                filter === k
                  ? 'bg-forge-cyan text-slate-900 font-bold'
                  : 'bg-forge-panel text-forge-text-secondary hover:text-white border border-forge-border'
              }`}
            >
              {icon}<span>{label}</span>
            </button>
          ))}
          {selectedState && (
            <button
              onClick={() => onSelectState(null)}
              className="px-2 py-1 rounded bg-forge-card hover:bg-forge-panel border border-forge-border text-forge-text-muted hover:text-white flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3 text-forge-amber" /><span>Reset State</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── Map SVG Column ── */}
        <div className="lg:col-span-7 rounded-xl overflow-hidden relative" style={{ background: '#0d1829' }}>
          {/* CSS animations */}
          <style>{`
            @keyframes radarPing {
              0%   { r: 3px; opacity: 0.9; }
              100% { r: 20px; opacity: 0; }
            }
            .radar-a { animation: radarPing 2.2s ease-out infinite; }
            .radar-b { animation: radarPing 2.2s ease-out infinite 1.1s; }
          `}</style>

          {/* Zoom hint / reset */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
            <button
              onClick={() => onSelectState(null)}
              title="Reset State Filter"
              className="w-7 h-7 flex items-center justify-center rounded bg-slate-800/80 border border-slate-600 text-slate-400 hover:text-white hover:border-cyan-500/60 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* THE MAP — pure SVG with d3-geo paths */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width="100%"
            height="auto"
            style={{ display: 'block' }}
            onMouseMove={handleSvgMouseMove}
            onMouseLeave={() => { setHoveredHub(null); setHoveredState(null); setTooltip(null); }}
          >
            {/* Dot grid background */}
            <defs>
              <pattern id="dotgrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#00f0ff" opacity="0.04" />
              </pattern>
            </defs>
            <rect width={SVG_W} height={SVG_H} fill="#0d1829" />
            <rect width={SVG_W} height={SVG_H} fill="url(#dotgrid)" />

            {/* ── State polygons ── */}
            {(indiaGeoJson as GeoJSON.FeatureCollection).features.map((feature) => {
              const geoName: string = (feature.properties as Record<string, string> | null)?.NAME_1 ?? '';
              const appName = GEO_NAME_MAP[geoName] ?? geoName;
              const d = pathGen(feature as GeoPermissibleObjects);
              if (!d) return null;

              const fill   = stateFill(appName, caseMap, selectedState, hoveredState, filter);
              const stroke = stateStroke(appName, caseMap, selectedState, hoveredState);
              const sw     = selectedState === appName ? 1.4 : hoveredState === appName ? 1.0 : 0.5;

              return (
                <path
                  key={geoName}
                  d={d}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={sw}
                  strokeLinejoin="round"
                  style={{ cursor: 'pointer', transition: 'fill 0.18s' }}
                  onMouseEnter={() => setHoveredState(appName)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => selectedState === appName ? onSelectState(null) : onSelectState(appName)}
                />
              );
            })}

            {/* ── Corridor arcs ── */}
            {CORRIDORS.map((cor, idx) => {
              const from = HUBS.find(h => h.id === cor.fromId);
              const to   = HUBS.find(h => h.id === cor.toId);
              if (!from || !to) return null;
              const d = corridorPath(from, to);
              const speed = 1.4;
              const off = (animTick * speed) % 26;
              const finalOff = idx % 2 === 0 ? -off : off;

              return (
                <g key={cor.id}>
                  {/* Glow */}
                  <path d={d} fill="none" stroke={cor.color} strokeWidth={4} strokeOpacity={0.07} />
                  {/* Dashed animated line */}
                  <path d={d} fill="none" stroke={cor.color} strokeWidth={1.2} strokeOpacity={0.65}
                    strokeDasharray="9 6" strokeDashoffset={finalOff} strokeLinecap="round" />
                  {/* Leading pulse */}
                  <path d={d} fill="none" stroke={cor.color} strokeWidth={0.5} strokeOpacity={0.95}
                    strokeDasharray="3 50" strokeDashoffset={finalOff * 2.5} strokeLinecap="round" />
                </g>
              );
            })}

            {/* ── Tactical hub markers ── */}
            {filteredHubs.map(hub => {
              const [x, y]  = project(hub.lng, hub.lat);
              const color   = hubColor(hub);
              const isCrit  = hub.priority === 'CRITICAL';
              const isHov   = hoveredHub?.id === hub.id;
              const r       = isHov ? 5 : 3.5;

              return (
                <g
                  key={hub.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredHub(hub)}
                  onMouseLeave={() => setHoveredHub(null)}
                  onClick={e => { e.stopPropagation(); onSelectState(hub.state); onSelectCase(hub.caseId); }}
                >
                  {/* Radar ping ring A */}
                  <circle cx={x} cy={y} r={isCrit ? 6 : 5} fill="none"
                    stroke={color} strokeWidth={1} className="radar-a" style={{ color }} opacity={0} />
                  {/* Radar ping ring B */}
                  <circle cx={x} cy={y} r={isCrit ? 5 : 4} fill="none"
                    stroke={color} strokeWidth={0.7} className="radar-b" style={{ color }} opacity={0} />
                  {/* Solid dot */}
                  <circle cx={x} cy={y} r={r} fill={color} fillOpacity={0.9} stroke="#0d1829" strokeWidth={1.2} />
                  {/* White centre */}
                  <circle cx={x} cy={y} r={1.1} fill="#fff" fillOpacity={0.95} />
                </g>
              );
            })}

            {/* ── Hub tooltip ── */}
            {hoveredHub && tooltip && (() => {
              const [x, y] = project(hoveredHub.lng, hoveredHub.lat);
              const tx = Math.min(x + 10, SVG_W - 185);
              const ty = Math.max(y - 115, 4);
              return (
                <g transform={`translate(${tx},${ty})`} style={{ pointerEvents: 'none' }}>
                  <rect rx={6} ry={6} width={175} height={110} fill="#0f172a" stroke="#22d3ee" strokeWidth={0.8} fillOpacity={0.97} />
                  <text x={10} y={20} fontSize={10} fontWeight="bold" fill="#22d3ee">{hoveredHub.city}</text>
                  <text x={10} y={34} fontSize={10} fontWeight="bold" fill="#fff">{hoveredHub.caseName}</text>
                  <text x={10} y={48} fontSize={9} fill="#94a3b8">{hoveredHub.category}</text>
                  <line x1={10} y1={55} x2={165} y2={55} stroke="#334155" strokeWidth={0.5} />
                  <text x={10} y={70} fontSize={8.5} fill="#94a3b8">{hoveredHub.activityNote.slice(0, 45)}{hoveredHub.activityNote.length > 45 ? '…' : ''}</text>
                  <text x={10} y={100} fontSize={9} fill="#64748b">Threat Level</text>
                  <text x={165} y={100} textAnchor="end" fontSize={10} fontWeight="bold" fill="#f43f5e">{hoveredHub.threatLevel}%</text>
                </g>
              );
            })()}

            {/* ── State hover tooltip ── */}
            {hoveredState && !hoveredHub && tooltip && (() => {
              const d = caseMap[hoveredState];
              const tx = Math.min(tooltip.x + 10, SVG_W - 175);
              const ty = Math.max(tooltip.y - 48, 4);
              return (
                <g transform={`translate(${tx},${ty})`} style={{ pointerEvents: 'none' }}>
                  <rect rx={5} ry={5} width={160} height={38} fill="#0f172a" stroke="#475569" strokeWidth={0.7} fillOpacity={0.97} />
                  <text x={10} y={15} fontSize={10} fontWeight="bold" fill="#fff">{hoveredState}</text>
                  <text x={10} y={29} fontSize={9} fill={d ? '#22d3ee' : '#64748b'}>
                    {d ? `${d.count} active operation${d.count !== 1 ? 's' : ''} · click to filter` : 'No active operations · click to select'}
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-slate-700/50 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-3">
              {([
                { color: '#f43f5e', label: 'Critical / Women-Safety', pulse: true  },
                { color: '#f59e0b', label: 'Financial / Cyber',       pulse: false },
                { color: '#00f0ff', label: 'Transit Nodes',           pulse: false },
              ]).map(({ color, label, pulse }) => (
                <span key={label} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pulse ? 'animate-pulse' : ''}`} style={{ backgroundColor: color }} />
                  <span>{label}</span>
                </span>
              ))}
            </div>
            <span className="text-[9px] text-cyan-700">CLICK STATE TO FILTER</span>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-forge-bg rounded-xl border border-forge-border p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-forge-border/60 pb-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-forge-cyan" />
                <span className="font-bold text-white text-xs font-mono uppercase">
                  {selectedState ? `${selectedState} Operations` : 'Pan-India Operations View'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-forge-cyan font-bold">
                  {selectedState ? `${activeCases.length} Active in State` : `${cases.length} Total Operations`}
                </span>
                {selectedState && (
                  <button
                    onClick={() => onSelectState(null)}
                    className="px-2 py-0.5 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-forge-text-muted hover:text-white text-[10px] font-mono transition flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3 text-forge-cyan" /><span>Pan-India</span>
                  </button>
                )}
              </div>
            </div>

            {selectedState ? (
              <div className="space-y-2.5">
                <p className="text-xs text-forge-text-secondary leading-relaxed">
                  Showing cases in <span className="text-white font-bold">{selectedState}</span>. Click any case to inspect.
                </p>
                {activeCases.length > 0 ? (
                  <div className="space-y-2">
                    {activeCases.map(c => (
                      <div
                        key={c.id}
                        onClick={() => onSelectCase(c.id)}
                        className="p-3 rounded-lg bg-forge-card border border-forge-border hover:border-forge-cyan transition cursor-pointer space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-forge-cyan">{c.code}</span>
                          <div className="flex items-center space-x-1">
                            <CaseStatusBadge status={c.status} size="xs" />
                            <SeverityBadge level={c.priority} size="xs" />
                          </div>
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-forge-cyan transition leading-snug">{c.name}</h4>
                        <div className="flex items-center justify-between text-[10px] font-mono text-forge-text-muted pt-1">
                          <span>{c.location}</span>
                          <span className="text-forge-cyan flex items-center space-x-0.5">
                            <span>Open</span><ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-forge-text-muted font-mono bg-forge-card rounded border border-dashed border-forge-border space-y-2">
                    <div>No active cases in this jurisdiction.</div>
                    <button
                      onClick={() => onSelectState(null)}
                      className="px-3 py-1 rounded bg-forge-cyan/20 hover:bg-forge-cyan/30 text-forge-cyan border border-forge-cyan/40 text-xs font-bold transition"
                    >Restore Pan-India View</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-forge-text-secondary leading-relaxed">
                  Click any state on the map to filter cases by jurisdiction:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(caseMap).map(([stName, data]) => (
                    <button
                      key={stName}
                      onClick={() => onSelectState(stName)}
                      className="p-2.5 rounded bg-forge-card border border-forge-border hover:border-forge-cyan/50 text-left transition flex flex-col"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-[11px] truncate">{stName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-forge-cyan/15 text-forge-cyan font-bold text-[10px]">{data.count}</span>
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

          {/* Corridor Summary */}
          <div className="p-3.5 bg-forge-bg rounded-xl border border-forge-border space-y-2 font-mono text-xs">
            <div className="text-[10px] text-forge-text-muted uppercase flex items-center justify-between">
              <span>INTER-STATE SYNDICATE CORRIDORS</span>
              <Activity className="w-3.5 h-3.5 text-forge-emerald" />
            </div>
            <div className="space-y-1.5 text-[11px]">
              {CORRIDORS.map(c => (
                <div key={c.id} className="flex items-center justify-between text-forge-text-secondary">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <span>{c.label}:</span>
                  </div>
                  <span className="font-bold" style={{ color: c.color }}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
