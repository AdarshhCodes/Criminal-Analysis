import React, { useState } from 'react';
import { Filter, ChevronLeft, Sliders } from 'lucide-react';
import { useInvestigationStore } from '../../stores';
import { EntityType, VerificationStatus } from '../../types';
import { graphService } from '../../services';

export const GraphFiltersPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const { graphFilters, setGraphFilters } = useInvestigationStore();

  const allEntityTypes: { type: EntityType; label: string }[] = [
    { type: 'PERSON', label: 'Person' },
    { type: 'PHONE', label: 'Phone / Burner' },
    { type: 'BANK_ACCOUNT', label: 'Bank Account' },
    { type: 'LOCATION', label: 'Location' },
    { type: 'VEHICLE', label: 'Vehicle' },
    { type: 'ORGANIZATION', label: 'Organization' },
  ];

  const toggleEntityType = (type: EntityType) => {
    const current = graphFilters.entityTypes;
    if (current.includes(type)) {
      setGraphFilters({ entityTypes: current.filter((t) => t !== type) });
    } else {
      setGraphFilters({ entityTypes: [...current, type] });
    }
  };

  const toggleVerificationStatus = (status: VerificationStatus) => {
    const current = graphFilters.verificationStatuses;
    if (current.includes(status)) {
      setGraphFilters({ verificationStatuses: current.filter((s) => s !== status) });
    } else {
      setGraphFilters({ verificationStatuses: [...current, status] });
    }
  };

  const applyPreset = (preset: 'ALL' | 'TELECOM' | 'HAWALA') => {
    if (preset === 'ALL') {
      setGraphFilters({
        entityTypes: ['PERSON', 'PHONE', 'BANK_ACCOUNT', 'LOCATION', 'VEHICLE', 'ORGANIZATION'],
        minRiskScore: 0,
        showOnlyHighRisk: false,
      });
    } else if (preset === 'TELECOM') {
      setGraphFilters({
        entityTypes: ['PERSON', 'PHONE', 'LOCATION'],
        minRiskScore: 0,
        showOnlyHighRisk: false,
      });
    } else if (preset === 'HAWALA') {
      setGraphFilters({
        entityTypes: ['PERSON', 'BANK_ACCOUNT', 'ORGANIZATION', 'LOCATION'],
        minRiskScore: 60,
        showOnlyHighRisk: false,
      });
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute left-3 top-16 bg-forge-card border border-forge-border rounded-md p-2 text-forge-cyan hover:bg-forge-cardHover shadow-panel z-10 transition pointer-events-auto"
        title="Open Graph Filters"
      >
        <Sliders className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="absolute left-3 top-16 w-64 bg-forge-card/95 backdrop-blur border border-forge-border rounded-lg p-3.5 shadow-panel z-10 font-mono text-xs space-y-3.5 pointer-events-auto select-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-forge-border/60 pb-2">
        <div className="flex items-center space-x-1.5 text-forge-cyan font-bold">
          <Filter className="w-3.5 h-3.5" />
          <span>GRAPH CONTROLS</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded text-forge-text-muted hover:text-white transition"
          title="Collapse Panel"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preset Quick Filters */}
      <div className="space-y-1.5">
        <div className="text-[10px] text-forge-text-muted uppercase">INVESTIGATION PRESETS</div>
        <div className="grid grid-cols-3 gap-1 text-[10px]">
          <button
            onClick={() => applyPreset('ALL')}
            className="p-1.5 rounded bg-forge-bg hover:bg-forge-card border border-forge-border text-center text-forge-text-secondary hover:text-white transition"
          >
            All
          </button>
          <button
            onClick={() => applyPreset('TELECOM')}
            className="p-1.5 rounded bg-forge-bg hover:bg-forge-card border border-forge-border text-center text-forge-amber hover:text-white transition"
          >
            Telecom
          </button>
          <button
            onClick={() => applyPreset('HAWALA')}
            className="p-1.5 rounded bg-forge-bg hover:bg-forge-card border border-forge-border text-center text-forge-emerald hover:text-white transition"
          >
            Hawala
          </button>
        </div>
      </div>

      {/* Entity Type Toggles */}
      <div className="space-y-1.5">
        <div className="text-[10px] text-forge-text-muted uppercase">ENTITY TYPES</div>
        <div className="space-y-1 text-[11px]">
          {allEntityTypes.map(({ type, label }) => {
            const isChecked = graphFilters.entityTypes.includes(type);
            const color = graphService.getEntityTypeColor(type);

            return (
              <label
                key={type}
                className="flex items-center space-x-2 py-0.5 cursor-pointer hover:text-white transition"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleEntityType(type)}
                  className="rounded border-forge-border bg-forge-bg text-forge-cyan focus:ring-0 w-3.5 h-3.5"
                />
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className={isChecked ? 'text-white' : 'text-forge-text-muted'}>{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Minimum Risk Score Slider */}
      <div className="space-y-1.5 pt-2 border-t border-forge-border/40">
        <div className="flex justify-between text-[10px] text-forge-text-muted">
          <span>MIN RISK SCORE</span>
          <span className="text-white font-bold">{graphFilters.minRiskScore}</span>
        </div>
        <input
          type="range"
          min={0}
          max={90}
          step={5}
          value={graphFilters.minRiskScore}
          onChange={(e) => setGraphFilters({ minRiskScore: Number(e.target.value) })}
          className="w-full accent-cyan-500 cursor-pointer"
        />
      </div>

      {/* Show Only High Risk Switch */}
      <label className="flex items-center justify-between cursor-pointer pt-1">
        <span className="text-[11px] text-forge-rose font-medium">High Risk Only (&ge; 75)</span>
        <input
          type="checkbox"
          checked={graphFilters.showOnlyHighRisk}
          onChange={(e) => setGraphFilters({ showOnlyHighRisk: e.target.checked })}
          className="rounded border-forge-border bg-forge-bg text-forge-rose focus:ring-0 w-3.5 h-3.5"
        />
      </label>

      {/* Verification Status Filter */}
      <div className="space-y-1.5 pt-2 border-t border-forge-border/40">
        <div className="text-[10px] text-forge-text-muted uppercase">EDGE VERIFICATION</div>
        <div className="space-y-1 text-[11px]">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={graphFilters.verificationStatuses.includes('HUMAN_VERIFIED')}
              onChange={() => toggleVerificationStatus('HUMAN_VERIFIED')}
              className="rounded border-forge-border bg-forge-bg text-forge-emerald focus:ring-0 w-3.5 h-3.5"
            />
            <span className="w-2 h-0.5 bg-forge-emerald shrink-0" />
            <span className="text-forge-emerald">Verified Links</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={graphFilters.verificationStatuses.includes('AI_SUGGESTED')}
              onChange={() => toggleVerificationStatus('AI_SUGGESTED')}
              className="rounded border-forge-border bg-forge-bg text-forge-amber focus:ring-0 w-3.5 h-3.5"
            />
            <span className="w-2 h-0.5 border-b border-dashed border-forge-amber shrink-0" />
            <span className="text-forge-amber">AI Suggested</span>
          </label>
        </div>
      </div>
    </div>
  );
};
