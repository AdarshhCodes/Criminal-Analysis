import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  Share2,
  Clock,
  Filter,
  Search,
  Check,
  RotateCcw,
  Zap,
  Activity,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { alertService, investigationService } from '../services';
import { Alert, AlertSeverity, AlertStatus } from '../types';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectEntity,
    investigateAlertAction,
    acknowledgeAlertAction,
    resolveAlertAction,
  } = useInvestigationStore();

  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const rawAlerts = alertService.getAlerts();

  const filteredAlerts = rawAlerts.filter((alt) => {
    const matchesSeverity = severityFilter === 'ALL' || alt.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || alt.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      alt.title.toLowerCase().includes(q) ||
      alt.description.toLowerCase().includes(q) ||
      alt.type.toLowerCase().includes(q) ||
      alt.entityIds.some((id) => id.toLowerCase().includes(q));

    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const criticalCount = rawAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const highCount = rawAlerts.filter((a) => a.severity === 'HIGH').length;
  const activeCount = rawAlerts.filter((a) => a.status === 'NEW' || a.status === 'INVESTIGATING').length;

  const handleInvestigate = async (alert: Alert) => {
    await investigateAlertAction(alert);
    navigate('/graph');
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950/40 text-rose-400 border-rose-600/50';
      case 'HIGH':
        return 'bg-amber-950/40 text-amber-400 border-amber-600/50';
      case 'MEDIUM':
        return 'bg-forge-cyan/20 text-forge-cyan border-forge-cyan/40';
      case 'LOW':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-rose-950/30 text-rose-300 border-rose-800/40';
      case 'INVESTIGATING':
        return 'bg-forge-cyan/20 text-forge-cyan border-forge-cyan/40';
      case 'ACKNOWLEDGED':
        return 'bg-amber-950/30 text-amber-300 border-amber-800/40';
      case 'RESOLVED':
        return 'bg-forge-emerald/20 text-forge-emerald border-forge-emerald/40';
      default:
        return 'bg-forge-card text-forge-text-muted border-forge-border';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-forge-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-forge-amber font-mono text-xs">
            <ShieldAlert className="w-4 h-4 text-forge-amber" />
            <span>REAL-TIME ANOMALY DETECTION ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Proactive Intelligence Alerts
          </h1>
          <p className="text-xs text-forge-text-muted mt-0.5">
            Continuous surveillance monitoring detecting Hawala clusters, geofence breaches, burner SIM bursts, and unverified AI hypotheses.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-forge-emerald bg-forge-card px-3 py-1.5 rounded border border-forge-border">
          <Activity className="w-3.5 h-3.5" />
          <span>SWARM PATTERN SCANNER: ARMED</span>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-forge-card p-3 rounded-lg border border-forge-border">
          <div className="text-[10px] text-forge-text-muted uppercase">TOTAL ALERTS</div>
          <div className="text-xl font-bold text-white mt-0.5">{rawAlerts.length}</div>
          <div className="text-[10px] text-forge-text-secondary mt-0.5">{activeCount} Under Investigation</div>
        </div>
        <div className="bg-forge-card p-3 rounded-lg border border-forge-border">
          <div className="text-[10px] text-rose-400 uppercase font-semibold">CRITICAL SEVERITY</div>
          <div className="text-xl font-bold text-rose-400 mt-0.5">{criticalCount}</div>
          <div className="text-[10px] text-forge-text-muted mt-0.5">Immediate Threat</div>
        </div>
        <div className="bg-forge-card p-3 rounded-lg border border-forge-border">
          <div className="text-[10px] text-amber-400 uppercase font-semibold">HIGH SEVERITY</div>
          <div className="text-xl font-bold text-amber-400 mt-0.5">{highCount}</div>
          <div className="text-[10px] text-forge-text-muted mt-0.5">Tactical Priority</div>
        </div>
        <div className="bg-forge-card p-3 rounded-lg border border-forge-border">
          <div className="text-[10px] text-forge-cyan uppercase font-semibold">UNVERIFIED AI LINKS</div>
          <div className="text-xl font-bold text-forge-cyan mt-0.5">1</div>
          <div className="text-[10px] text-forge-text-muted mt-0.5">Quarantined from Court File</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-forge-card p-3.5 rounded-lg border border-forge-border space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
          {/* Severity Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            <span className="text-[10px] font-mono text-forge-text-muted uppercase mr-1">SEVERITY:</span>
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded font-mono font-medium transition ${
                  severityFilter === sev
                    ? 'bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40 shadow-sm'
                    : 'text-forge-text-secondary hover:text-white hover:bg-forge-bg'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status and Search */}
          <div className="flex items-center space-x-2.5 w-full lg:w-auto">
            <div className="flex items-center space-x-1.5 font-mono text-xs">
              <Filter className="w-3.5 h-3.5 text-forge-text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-forge-bg border border-forge-border text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-forge-cyan"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="relative flex-1 lg:w-64">
              <Search className="w-3.5 h-3.5 text-forge-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts, entities, types..."
                className="w-full bg-forge-bg border border-forge-border rounded pl-8 pr-3 py-1 text-xs text-white placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan"
              />
            </div>

            {(severityFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSeverityFilter('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="p-1.5 rounded text-forge-text-muted hover:text-white hover:bg-forge-bg transition"
                title="Reset Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alert Feed Cards */}
      <div className="space-y-3.5">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className="bg-forge-card border border-forge-border hover:border-forge-borderLight rounded-lg p-4 space-y-3 transition duration-150 shadow-md"
            >
              {/* Alert Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forge-border/60 pb-2">
                <div className="flex items-center space-x-2 font-mono text-[10px]">
                  <span className={`px-2 py-0.5 rounded font-bold border ${getSeverityBadge(alt.severity)}`}>
                    {alt.severity}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold border ${getStatusBadge(alt.status)}`}>
                    {alt.status}
                  </span>
                  <span className="text-forge-cyan font-bold bg-forge-bg px-2 py-0.5 rounded border border-forge-border">
                    {alt.type}
                  </span>
                  <span className="text-forge-text-muted">[{alt.id}]</span>
                </div>

                <div className="flex items-center space-x-3 font-mono text-[11px]">
                  <span className="text-forge-emerald font-bold">
                    Confidence: {alt.confidence}%
                  </span>
                  <span className="text-forge-text-muted flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(alt.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </span>
                </div>
              </div>

              {/* Alert Title & Description */}
              <div>
                <h3 className="text-sm font-bold text-white leading-snug">{alt.title}</h3>
                <p className="text-xs text-forge-text-secondary leading-relaxed mt-1 font-sans">
                  {alt.description}
                </p>
              </div>

              {/* Recommended Action Callout */}
              {alt.recommendedAction && (
                <div className="p-2.5 rounded bg-forge-bg border border-forge-border font-mono text-[11px] space-y-1">
                  <div className="text-[10px] text-forge-cyan font-bold uppercase flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>RECOMMENDED OPERATIONAL ACTION:</span>
                  </div>
                  <div className="text-white font-sans text-xs">{alt.recommendedAction}</div>
                </div>
              )}

              {/* Related Entities & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-forge-border/40 font-mono text-xs">
                {/* Related Entities */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-forge-text-muted font-bold">TARGETS:</span>
                  {alt.entityIds.map((id) => {
                    const ent = investigationService.getEntityById(id);
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          if (ent) selectEntity(ent);
                        }}
                        className="px-2 py-0.5 rounded bg-forge-bg hover:bg-forge-cyan/20 hover:text-forge-cyan border border-forge-border text-forge-text-secondary text-[10px] transition"
                      >
                        {ent ? ent.name : id}
                      </button>
                    );
                  })}
                </div>

                {/* Investigation Actions */}
                <div className="flex items-center space-x-2">
                  {alt.status === 'NEW' && (
                    <button
                      onClick={() => acknowledgeAlertAction(alt.id)}
                      className="px-2.5 py-1 rounded bg-forge-bg hover:bg-forge-card border border-forge-border text-forge-text-muted hover:text-white text-[11px] transition"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alt.status !== 'RESOLVED' && (
                    <button
                      onClick={() => resolveAlertAction(alt.id)}
                      className="px-2.5 py-1 rounded bg-forge-emerald/15 hover:bg-forge-emerald/30 border border-forge-emerald/30 text-forge-emerald font-bold text-[11px] flex items-center space-x-1 transition"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Resolved</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleInvestigate(alt)}
                    className="px-3 py-1 rounded bg-forge-cyan hover:bg-forge-cyanLight text-black font-bold text-[11px] flex items-center space-x-1.5 shadow-md shadow-cyan-900/30 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>INVESTIGATE ON GRAPH</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-forge-card rounded-lg border border-forge-border">
            <AlertTriangle className="w-10 h-10 text-forge-amber/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Intelligence Alerts Found</h3>
            <p className="text-xs text-forge-text-muted mt-1 max-w-sm mx-auto">
              No alert items correspond to the selected severity and status filters.
            </p>
            <button
              onClick={() => {
                setSeverityFilter('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-3 py-1.5 bg-forge-bg hover:bg-forge-panel border border-forge-border rounded text-xs text-forge-cyan font-mono transition"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
