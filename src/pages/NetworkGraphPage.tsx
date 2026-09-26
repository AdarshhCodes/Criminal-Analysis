import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Network,
  GitFork,
  Clock,
  MapPin,
  Table as TableIcon,
} from 'lucide-react';
import {
  CrossCaseConnectionGraph,
  SingleCaseDetailGraph,
  InvestigationTimelineSection,
  GraphMapView,
  GraphTableView,
} from '../components/graph';
import { useInvestigationStore } from '../stores';

export type ConnectionsViewMode =
  | 'CROSS_CASE'
  | 'SINGLE_CASE'
  | 'TIMELINE'
  | 'MAP'
  | 'TABLE';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMsg: string;
}

class GraphErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMsg: error?.message || 'Unknown render error' };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Graph Error Boundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 font-mono text-xs text-forge-text-muted">
          <div className="p-3 rounded-full bg-forge-rose/15 border border-forge-rose/30 text-forge-rose">
            <Network className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-white font-bold text-sm">Graph View Render Notice</h3>
            <p className="text-xs text-forge-text-secondary font-sans">
              The graph visualization encountered an issue rendering node elements.
            </p>
            <div className="text-[10px] text-forge-rose p-2.5 rounded bg-black/60 border border-forge-rose/30 text-left font-mono">
              {this.state.errorMsg}
            </div>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, errorMsg: '' });
              this.props.onReset();
            }}
            className="px-4 py-2 rounded-lg bg-forge-cyan text-slate-950 font-bold transition hover:bg-forge-cyanLight"
          >
            Reload Graph View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const NetworkGraphPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentCase, selectCase } = useInvestigationStore();

  const initialMode = (searchParams.get('view') as ConnectionsViewMode) || 'CROSS_CASE';
  const [activeMode, setActiveMode] = useState<ConnectionsViewMode>(initialMode);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    searchParams.get('caseId') || currentCase.id
  );

  // Sync state with URL params
  useEffect(() => {
    const viewParam = searchParams.get('view') as ConnectionsViewMode;
    if (viewParam && ['CROSS_CASE', 'SINGLE_CASE', 'TIMELINE', 'MAP', 'TABLE'].includes(viewParam)) {
      setActiveMode(viewParam);
    }
    const caseParam = searchParams.get('caseId');
    if (caseParam) {
      setSelectedCaseId(caseParam);
      selectCase(caseParam);
    }
  }, [searchParams, selectCase]);

  const handleModeChange = (mode: ConnectionsViewMode) => {
    setActiveMode(mode);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('view', mode);
      return next;
    });
  };

  const handleSwitchToSingleCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    selectCase(caseId);
    setActiveMode('SINGLE_CASE');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('view', 'SINGLE_CASE');
      next.set('caseId', caseId);
      return next;
    });
  };

  const handleSwitchToCrossCase = () => {
    setActiveMode('CROSS_CASE');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('view', 'CROSS_CASE');
      return next;
    });
  };

  return (
    <div className="relative w-full h-full min-h-[600px] flex-1 flex flex-col overflow-hidden bg-forge-bg select-none">
      {/* Top Header Mode Navigation Strip */}
      <div className="bg-forge-panel border-b border-forge-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20 shadow-panel">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-forge-cyan animate-pulse" />
            <h1 className="text-xs font-mono font-bold text-white tracking-widest uppercase">
              INVESTIGATION INTELLIGENCE SUITE
            </h1>
          </div>
          <span className="hidden sm:inline text-forge-text-muted text-xs">|</span>
          <span className="hidden sm:inline text-[11px] font-mono text-forge-text-muted">
            {activeMode === 'CROSS_CASE' && 'CROSS-OPERATION CONSTELLATION GRAPH'}
            {activeMode === 'SINGLE_CASE' && 'DEEP HIERARCHICAL CRIME BOARD (DAG)'}
            {activeMode === 'TIMELINE' && 'CHRONOLOGICAL PIPELINE & MILESTONES'}
            {activeMode === 'MAP' && 'GEOSPATIAL TACTICAL SURVEILLANCE'}
            {activeMode === 'TABLE' && 'MASTER ENTITY & RELATIONSHIP REGISTRY'}
          </span>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center space-x-1 bg-forge-bg/80 border border-forge-border p-1 rounded-lg overflow-x-auto max-w-full">
          {/* Graph View 1: Cross-Case Network */}
          <button
            onClick={() => handleModeChange('CROSS_CASE')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-mono font-bold transition whitespace-nowrap ${
              activeMode === 'CROSS_CASE'
                ? 'bg-forge-cyan text-slate-950 shadow-sm'
                : 'text-forge-text-secondary hover:text-white hover:bg-forge-card'
            }`}
            title="Graph View 1: Multi-operation cross-case network showing bridge targets"
          >
            <Network className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">CROSS-CASE NETWORK</span>
            <span className="sm:hidden">NETWORK</span>
          </button>

          {/* Graph View 2: Single-Case Detail DAG */}
          <button
            onClick={() => handleModeChange('SINGLE_CASE')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-mono font-bold transition whitespace-nowrap ${
              activeMode === 'SINGLE_CASE'
                ? 'bg-forge-cyan text-slate-950 shadow-sm'
                : 'text-forge-text-secondary hover:text-white hover:bg-forge-card'
            }`}
            title="Graph View 2: Deep hierarchical crime board flow for a single case"
          >
            <GitFork className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">SINGLE-CASE DAG</span>
            <span className="sm:hidden">DAG</span>
          </button>

          {/* Section: Timeline & Pipeline */}
          <button
            onClick={() => handleModeChange('TIMELINE')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-mono font-bold transition whitespace-nowrap ${
              activeMode === 'TIMELINE'
                ? 'bg-forge-cyan text-slate-950 shadow-sm'
                : 'text-forge-text-secondary hover:text-white hover:bg-forge-card'
            }`}
            title="Progression of investigation activity, exhibits, and milestones over time"
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">TIMELINE / PIPELINE</span>
            <span className="sm:hidden">TIMELINE</span>
          </button>

          {/* Map */}
          <button
            onClick={() => handleModeChange('MAP')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition whitespace-nowrap ${
              activeMode === 'MAP'
                ? 'bg-forge-cyan text-slate-950 shadow-sm'
                : 'text-forge-text-secondary hover:text-white hover:bg-forge-card'
            }`}
            title="Geospatial Map Surveillance View"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>MAP</span>
          </button>

          {/* Table */}
          <button
            onClick={() => handleModeChange('TABLE')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition whitespace-nowrap ${
              activeMode === 'TABLE'
                ? 'bg-forge-cyan text-slate-950 shadow-sm'
                : 'text-forge-text-secondary hover:text-white hover:bg-forge-card'
            }`}
            title="Tabular Entity & Relationship Inspector"
          >
            <TableIcon className="w-3.5 h-3.5 shrink-0" />
            <span>TABLE</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
        <GraphErrorBoundary key={activeMode} onReset={() => setActiveMode('CROSS_CASE')}>
          {/* GRAPH VIEW 1: Cross-Case Connection Network */}
          {activeMode === 'CROSS_CASE' && (
            <CrossCaseConnectionGraph onSelectCase={handleSwitchToSingleCase} />
          )}

          {/* GRAPH VIEW 2: Single-Case Detail Graph (DAG Crime Board) */}
          {activeMode === 'SINGLE_CASE' && (
            <SingleCaseDetailGraph
              initialCaseId={selectedCaseId}
              onSelectCase={handleSwitchToSingleCase}
              onSwitchToCrossCase={handleSwitchToCrossCase}
            />
          )}

          {/* TIMELINE / PIPELINE: Progression of Activity Over Time */}
          {activeMode === 'TIMELINE' && (
            <InvestigationTimelineSection
              onSwitchToSingleCase={handleSwitchToSingleCase}
              onSwitchToCrossCase={handleSwitchToCrossCase}
            />
          )}

          {/* GEOSPATIAL MAP VIEW */}
          {activeMode === 'MAP' && (
            <div className="flex-1 w-full h-full relative">
              <GraphMapView />
            </div>
          )}

          {/* TABULAR MASTER GRID */}
          {activeMode === 'TABLE' && (
            <div className="flex-1 w-full h-full relative">
              <GraphTableView />
            </div>
          )}
        </GraphErrorBoundary>
      </div>
    </div>
  );
};
export default NetworkGraphPage;
