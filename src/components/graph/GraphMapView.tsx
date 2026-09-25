import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Radio,
  ExternalLink,
  Car,
  PhoneCall,
  Globe,
} from 'lucide-react';
import { useInvestigationStore } from '../../stores';
import { Entity } from '../../types';

interface TacticalGeoPoint {
  id: string;
  name: string;
  type: 'WAREHOUSE' | 'SAFEHOUSE' | 'HAWALA_DESK' | 'CELL_TOWER' | 'TOLL_PLAZA' | 'OFFSHORE_DESK';
  entityId?: string;
  lat: number;
  lng: number;
  riskScore: number;
  role: string;
  address: string;
  sightingCount: number;
  lastSighting: string;
  activeSurveillance: boolean;
  transitConnections: string[]; // target ids
}

// Master geospatial dataset for Operation Falcon
const GEO_LOCATIONS: TacticalGeoPoint[] = [
  {
    id: 'GEO-01',
    name: 'Okhla Warehouse #14',
    type: 'WAREHOUSE',
    entityId: 'IF-LOC-001',
    lat: 28.5355,
    lng: 77.2798,
    riskScore: 84,
    role: 'Central Logistics & Staging Facility (Shed 14)',
    address: 'Okhla Industrial Area Phase III, New Delhi',
    sightingCount: 18,
    lastSighting: '2026-09-10 16:00 IST',
    activeSurveillance: true,
    transitConnections: ['GEO-04', 'GEO-02'],
  },
  {
    id: 'GEO-02',
    name: 'Sector 62 Safehouse',
    type: 'SAFEHOUSE',
    entityId: 'IF-LOC-002',
    lat: 28.6280,
    lng: 77.3649,
    riskScore: 78,
    role: 'Burner SIM Stock & Equipment Cache',
    address: 'Tower 4, Flat 602, Sector 62, Noida, UP',
    sightingCount: 11,
    lastSighting: '2026-09-08 20:30 IST',
    activeSurveillance: true,
    transitConnections: ['GEO-01'],
  },
  {
    id: 'GEO-03',
    name: 'Karol Bagh Bullion Center',
    type: 'HAWALA_DESK',
    entityId: 'IF-LOC-003',
    lat: 28.6520,
    lng: 77.1906,
    riskScore: 88,
    role: 'Hawala Cash-in / Cash-out Front (Surya Bullion)',
    address: 'Gali 12, Naiwala, Karol Bagh, New Delhi',
    sightingCount: 26,
    lastSighting: '2026-09-10 19:00 IST',
    activeSurveillance: true,
    transitConnections: ['GEO-04', 'GEO-05'],
  },
  {
    id: 'GEO-04',
    name: 'DND Flyway Toll Plaza',
    type: 'TOLL_PLAZA',
    lat: 28.5833,
    lng: 77.2975,
    riskScore: 75,
    role: 'Automated Fastag Courier Intercept Corridor',
    address: 'DND Flyway Expressway Plaza, Delhi-Noida',
    sightingCount: 14,
    lastSighting: '2026-09-10 15:20 IST',
    activeSurveillance: true,
    transitConnections: ['GEO-01', 'GEO-02'],
  },
  {
    id: 'GEO-05',
    name: 'Vasant Vihar Secure Cell Tower',
    type: 'CELL_TOWER',
    lat: 28.5600,
    lng: 77.1600,
    riskScore: 92,
    role: 'Rajesh Kumar Encrypted Voice Cell (CELL-DEL-VV-401)',
    address: 'Sector 4, Vasant Vihar, South West Delhi',
    sightingCount: 32,
    lastSighting: '2026-09-10 18:22 IST',
    activeSurveillance: true,
    transitConnections: ['GEO-03'],
  },
  {
    id: 'GEO-06',
    name: 'Seelampur Bulk SIM Outlets',
    type: 'SAFEHOUSE',
    lat: 28.6700,
    lng: 77.2700,
    riskScore: 82,
    role: 'Pooja Verma Fake e-KYC SIM Retail Source',
    address: 'Main Market, Seelampur, North East Delhi',
    sightingCount: 9,
    lastSighting: '2026-09-08 19:05 IST',
    activeSurveillance: false,
    transitConnections: ['GEO-03'],
  },
];

export const GraphMapView: React.FC = () => {
  const { selectEntity } = useInvestigationStore();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedGeoPoint, setSelectedGeoPoint] = useState<TacticalGeoPoint | null>(GEO_LOCATIONS[0]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [viewScope, setViewScope] = useState<'NCR' | 'GLOBAL'>('NCR');

  // Delhi NCR bounding box coordinates
  // Lat: 28.50 to 28.72, Lng: 77.12 to 77.40
  const ncrBounds = {
    minLat: 28.50,
    maxLat: 28.72,
    minLng: 77.12,
    maxLng: 77.40,
  };

  // Convert lat/lng to normalized 0-100 percentage coordinates for SVG
  const projectCoords = (lat: number, lng: number) => {
    if (viewScope === 'GLOBAL') {
      // Global scope (Delhi to Dubai)
      // Lat: 24 to 30, Lng: 54 to 78
      const x = ((lng - 54.0) / (78.0 - 54.0)) * 80 + 10;
      const y = (1 - (lat - 24.0) / (30.0 - 24.0)) * 70 + 15;
      return { x, y };
    }

    // NCR scope
    const x = ((lng - ncrBounds.minLng) / (ncrBounds.maxLng - ncrBounds.minLng)) * 76 + 12;
    const y = (1 - (lat - ncrBounds.minLat) / (ncrBounds.maxLat - ncrBounds.minLat)) * 74 + 13;
    return { x, y };
  };

  const filteredPoints = useMemo(() => {
    if (activeFilter === 'ALL') return GEO_LOCATIONS;
    return GEO_LOCATIONS.filter((p) => p.type === activeFilter);
  }, [activeFilter]);

  const handlePointClick = (point: TacticalGeoPoint) => {
    setSelectedGeoPoint(point);
    if (point.entityId) {
      // Create synthetic entity representation to activate ContextPanel
      const mockEntity: Entity = {
        id: point.entityId,
        type: 'LOCATION',
        name: point.name,
        role: point.role,
        riskScore: point.riskScore,
        status: point.riskScore >= 80 ? 'HIGH_RISK' : 'ACTIVE',
        primaryIdentifier: `GEO: ${point.lat.toFixed(4)}° N, ${point.lng.toFixed(4)}° E`,
        tags: [point.type, 'Tactical Grid Sighting', 'Active Surveillance'],
        metadata: {
          address: point.address,
          sightingCount: point.sightingCount,
          lastSighting: point.lastSighting,
          surveillanceStatus: point.activeSurveillance ? 'CONTINUOUS SIGINT' : 'PASSIVE LOGS',
        },
      };
      selectEntity(mockEntity);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-forge-bg select-none font-mono">
      {/* Top Map Tactical HUD Controls */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-20 pointer-events-none">
        {/* Scope and Filter Selector */}
        <div className="flex items-center space-x-2 bg-forge-card/90 backdrop-blur border border-forge-border rounded-lg p-1.5 shadow-panel pointer-events-auto text-xs">
          <div className="flex items-center space-x-1 border-r border-forge-border pr-2 mr-1">
            <Compass className="w-3.5 h-3.5 text-forge-cyan" />
            <button
              onClick={() => setViewScope('NCR')}
              className={`px-2 py-0.5 rounded text-[11px] transition ${
                viewScope === 'NCR'
                  ? 'bg-forge-cyan text-slate-900 font-bold'
                  : 'text-forge-text-secondary hover:text-white'
              }`}
            >
              DELHI NCR SECTOR
            </button>
            <button
              onClick={() => setViewScope('GLOBAL')}
              className={`px-2 py-0.5 rounded text-[11px] transition ${
                viewScope === 'GLOBAL'
                  ? 'bg-forge-cyan text-slate-900 font-bold'
                  : 'text-forge-text-secondary hover:text-white'
              }`}
            >
              DUBAI CORRIDOR
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-1 text-[10px]">
            {['ALL', 'WAREHOUSE', 'HAWALA_DESK', 'SAFEHOUSE', 'CELL_TOWER'].map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-2 py-0.5 rounded transition ${
                  activeFilter === type
                    ? 'bg-forge-panel text-forge-cyan border border-forge-cyan/40 font-bold'
                    : 'text-forge-text-muted hover:text-white'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center space-x-1.5 bg-forge-card/90 backdrop-blur border border-forge-border rounded-lg p-1.5 shadow-panel pointer-events-auto">
          <button
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))}
            className="p-1.5 rounded hover:bg-forge-cardHover text-forge-text-muted hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))}
            className="p-1.5 rounded hover:bg-forge-cardHover text-forge-text-muted hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded hover:bg-forge-cardHover text-forge-text-muted hover:text-white transition"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <div className="pl-1 text-[10px] text-forge-cyan font-bold border-l border-forge-border">
            {Math.round(zoomLevel * 100)}%
          </div>
        </div>
      </div>

      {/* Central Tactical GIS Vector Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center p-4">
        {/* Radar Background & Grid Lines */}
        <div
          className="relative w-full h-full max-w-5xl max-h-[85vh] bg-[#050911] border border-forge-border/80 rounded-xl overflow-hidden shadow-2xl transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Tactical SVG Grid Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
              </pattern>
              {/* Radar sweep radial glow */}
              <radialGradient id="radarCenter" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#050911" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#tacticalGrid)" />
            <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="2 4" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          </svg>

          {/* SVG Transit Vectors between locations */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {filteredPoints.map((point) => {
              const start = projectCoords(point.lat, point.lng);
              return point.transitConnections.map((connId) => {
                const target = GEO_LOCATIONS.find((p) => p.id === connId);
                if (!target) return null;
                const end = projectCoords(target.lat, target.lng);
                return (
                  <g key={`${point.id}-${connId}`}>
                    {/* Shadow Line */}
                    <line
                      x1={`${start.x}%`}
                      y1={`${start.y}%`}
                      x2={`${end.x}%`}
                      y2={`${end.y}%`}
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      strokeOpacity="0.3"
                      strokeDasharray="4 4"
                    />
                    {/* Animated Pulse Vector */}
                    <line
                      x1={`${start.x}%`}
                      y1={`${start.y}%`}
                      x2={`${end.x}%`}
                      y2={`${end.y}%`}
                      stroke={point.riskScore > 80 ? '#f43f5e' : '#06b6d4'}
                      strokeWidth="1.5"
                      strokeOpacity="0.7"
                      strokeDasharray="6 8"
                      className="animate-pulse"
                    />
                  </g>
                );
              });
            })}

            {/* Global Cross-border Remittance Arc (if Global Scope) */}
            {viewScope === 'GLOBAL' && (
              <path
                d="M 75 45 Q 45 20 18 55"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="5 5"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Location Interactive Pins */}
          {filteredPoints.map((loc) => {
            const coords = projectCoords(loc.lat, loc.lng);
            const isSelected = selectedGeoPoint?.id === loc.id;
            const isHighRisk = loc.riskScore >= 80;

            return (
              <div
                key={loc.id}
                onClick={() => handlePointClick(loc)}
                style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
              >
                {/* Radar pulse beacon for active surveillance */}
                {loc.activeSurveillance && (
                  <span
                    className={`absolute inset-0 rounded-full animate-ping opacity-35 ${
                      isHighRisk ? 'bg-forge-rose' : 'bg-forge-cyan'
                    }`}
                  />
                )}

                {/* Tactical Pin Button */}
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full border shadow-lg transition-transform ${
                    isSelected
                      ? 'scale-125 ring-2 ring-forge-cyan bg-forge-panel border-forge-cyan'
                      : isHighRisk
                      ? 'bg-rose-950/80 border-rose-500 hover:scale-110'
                      : 'bg-forge-card border-forge-border hover:scale-110'
                  }`}
                >
                  {loc.type === 'WAREHOUSE' && <Layers className="w-3.5 h-3.5 text-forge-cyan" />}
                  {loc.type === 'SAFEHOUSE' && <Radio className="w-3.5 h-3.5 text-forge-amber" />}
                  {loc.type === 'HAWALA_DESK' && <MapPin className="w-3.5 h-3.5 text-forge-rose" />}
                  {loc.type === 'TOLL_PLAZA' && <Car className="w-3.5 h-3.5 text-forge-emerald" />}
                  {loc.type === 'CELL_TOWER' && <PhoneCall className="w-3.5 h-3.5 text-forge-cyan" />}
                  {loc.type === 'OFFSHORE_DESK' && <Globe className="w-3.5 h-3.5 text-forge-amber" />}
                </div>

                {/* Floating Tag Label */}
                <div
                  className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-md transition-all ${
                    isSelected
                      ? 'bg-forge-cyan text-slate-900 border border-forge-cyan'
                      : 'bg-forge-panel/90 text-forge-text-secondary border border-forge-border/80 group-hover:text-white'
                  }`}
                >
                  {loc.name}
                </div>
              </div>
            );
          })}

          {/* Dubai Node for Global Scope */}
          {viewScope === 'GLOBAL' && (
            <div
              style={{ left: '18%', top: '55%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
              onClick={() =>
                handlePointClick({
                  id: 'GEO-DUBAI',
                  name: 'Deira Gold Souk Office, Dubai',
                  type: 'OFFSHORE_DESK',
                  entityId: 'IF-LOC-004',
                  lat: 25.2697,
                  lng: 55.2974,
                  riskScore: 90,
                  role: 'Mohd. Tariq Offshore Hawala Settlement Node',
                  address: 'Al-Sabha Building, Deira, Dubai, UAE',
                  sightingCount: 22,
                  lastSighting: '2026-09-10 23:50 IST',
                  activeSurveillance: true,
                  transitConnections: [],
                })
              }
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full border border-amber-500 bg-amber-950/80 ring-2 ring-amber-400 animate-pulse">
                <Globe className="w-4 h-4 text-amber-300" />
              </div>
              <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-forge-panel text-forge-amber border border-amber-500/40">
                DUBAI DEIRA NODE (AL-NOOR)
              </div>
            </div>
          )}

          {/* Bottom Left Tactical Metadata Watermark */}
          <div className="absolute bottom-3 left-3 p-2 rounded bg-forge-card/90 backdrop-blur border border-forge-border text-[10px] text-forge-text-muted space-y-0.5">
            <div className="text-forge-cyan font-bold flex items-center space-x-1">
              <Navigation className="w-3 h-3" />
              <span>OPERATION FALCON // GEOSPATIAL SURVEILLANCE</span>
            </div>
            <div>COORDINATE DATUM: WGS 84 (GPS STANDARD)</div>
            <div>GEO-FENCE ZONES: 6 ACTIVE · SIGHTINGS LOGGED: 132</div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Tactical Target Inspector */}
      {selectedGeoPoint && (
        <div className="absolute bottom-3 right-3 max-w-md w-full bg-forge-card/95 backdrop-blur border border-forge-border rounded-lg p-4 shadow-panel z-20 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-forge-panel border border-forge-border text-forge-cyan">
                  {selectedGeoPoint.type}
                </span>
                <span
                  className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                    selectedGeoPoint.riskScore >= 80
                      ? 'bg-forge-rose/20 text-forge-rose'
                      : 'bg-forge-amber/20 text-forge-amber'
                  }`}
                >
                  RISK: {selectedGeoPoint.riskScore}/100
                </span>
              </div>
              <h3 className="text-sm font-bold text-white font-sans">{selectedGeoPoint.name}</h3>
            </div>

            {selectedGeoPoint.entityId && (
              <button
                onClick={() => handlePointClick(selectedGeoPoint)}
                className="px-2 py-1 rounded bg-forge-cyan/15 hover:bg-forge-cyan/25 border border-forge-cyan/40 text-forge-cyan text-[11px] font-bold flex items-center space-x-1 transition"
                title="Inspect in Context Dossier"
              >
                <span>DOSSIER</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <p className="text-xs text-forge-text-secondary leading-relaxed font-sans">{selectedGeoPoint.role}</p>

          <div className="grid grid-cols-2 gap-2 text-[10px] bg-forge-bg p-2.5 rounded border border-forge-border">
            <div>
              <span className="text-forge-text-muted">COORDINATES:</span>
              <div className="text-white font-mono">{selectedGeoPoint.lat.toFixed(4)}° N, {selectedGeoPoint.lng.toFixed(4)}° E</div>
            </div>
            <div>
              <span className="text-forge-text-muted">PHYSICAL ADDRESS:</span>
              <div className="text-forge-text-secondary truncate">{selectedGeoPoint.address}</div>
            </div>
            <div>
              <span className="text-forge-text-muted">SIGHTINGS LOGGED:</span>
              <div className="text-forge-cyan font-bold">{selectedGeoPoint.sightingCount} Verified Events</div>
            </div>
            <div>
              <span className="text-forge-text-muted">LAST DETECTED:</span>
              <div className="text-forge-emerald font-bold">{selectedGeoPoint.lastSighting}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
