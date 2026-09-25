import { Settings, Shield, Server } from 'lucide-react';
import { useInvestigationStore } from '../stores';

export const SettingsPage: React.FC = () => {
  const { currentInvestigator } = useInvestigationStore();

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between border-b border-forge-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs">
            <Settings className="w-4 h-4" />
            <span>PLATFORM CONFIGURATION</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">System Settings</h1>
          <p className="text-xs text-forge-text-muted mt-0.5">
            Cryptographic parameters, multi-agent endpoints, and law enforcement gateway boundaries.
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs font-mono">
        {/* Officer Credentials */}
        <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
          <div className="flex items-center space-x-2 text-forge-cyan font-bold">
            <Shield className="w-4 h-4" />
            <span>OFFICER CREDENTIALS &amp; ROLE</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-forge-text-muted block text-[10px]">NAME</span>
              <span className="text-white">{currentInvestigator.name}</span>
            </div>
            <div>
              <span className="text-forge-text-muted block text-[10px]">BADGE ID</span>
              <span className="text-white">{currentInvestigator.badge}</span>
            </div>
            <div>
              <span className="text-forge-text-muted block text-[10px]">AUTHORIZATION ROLE</span>
              <span className="text-forge-emerald">{currentInvestigator.role}</span>
            </div>
            <div>
              <span className="text-forge-text-muted block text-[10px]">AGENCY</span>
              <span className="text-white">{currentInvestigator.agency}</span>
            </div>
          </div>
        </div>

        {/* Prototype Configuration Boundary */}
        <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
          <div className="flex items-center space-x-2 text-forge-amber font-bold">
            <Server className="w-4 h-4" />
            <span>INTELLIGENCE ENVIRONMENT CONFIGURATION</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-forge-border/40">
              <span className="text-forge-text-muted">DATA BOUNDARY:</span>
              <span className="text-forge-emerald">SYNTHETIC DEMO MODE (STANDALONE)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-forge-border/40">
              <span className="text-forge-text-muted">BLOCKCHAIN AUDIT:</span>
              <span className="text-forge-emerald">SHA-256 CLIENT LEDGER ENABLED</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-forge-border/40">
              <span className="text-forge-text-muted">GRAPH ENGINE:</span>
              <span className="text-forge-cyan">CYTOSCAPE.JS CORE</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-forge-text-muted">FUTURE INTEGRATION GATEWAYS:</span>
              <span className="text-forge-text-secondary">NCRB / CCTNS, CMS, FIU-IND (REST API)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
