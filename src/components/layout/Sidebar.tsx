import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Network,
  FileSearch,
  Clock,
  AlertTriangle,
  Cpu,
  FileText,
  ShieldAlert,
  Settings,
} from 'lucide-react';
import { useInvestigationStore } from '../../stores';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { currentCase } = useInvestigationStore();

  const navigationItems: NavItem[] = [
    { name: 'Command Centre', path: '/command-centre', icon: LayoutDashboard },
    { name: 'Investigations', path: '/investigations', icon: FolderKanban },
    { name: 'Network Graph', path: '/graph', icon: Network },
    {
      name: 'Evidence Vault',
      path: '/evidence',
      icon: FileSearch,
      badge: currentCase.evidenceCount,
      badgeColor: 'bg-forge-cyan/20 text-forge-cyan',
    },
    { name: 'Chronological Timeline', path: '/timeline', icon: Clock },
    {
      name: 'Proactive Alerts',
      path: '/alerts',
      icon: AlertTriangle,
      badge: currentCase.alertCount,
      badgeColor: 'bg-forge-rose/20 text-forge-rose',
    },
    { name: 'AI Copilot Reasoning', path: '/ai', icon: Cpu },
    { name: 'Court Reports', path: '/reports', icon: FileText },
    { name: 'Blockchain Audit Trail', path: '/audit', icon: ShieldAlert },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-forge-panel border-r border-forge-border flex flex-col justify-between select-none shrink-0 z-20">
      {/* Navigation Links */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono tracking-wider text-forge-text-muted uppercase">
          WORKSPACE NAVIGATION
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded text-xs transition font-medium ${
                  isActive
                    ? 'bg-forge-cyan/15 text-forge-cyan border-l-2 border-forge-cyan shadow-sm font-semibold'
                    : 'text-forge-text-secondary hover:text-white hover:bg-forge-card'
                }`
              }
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.badgeColor || 'bg-forge-card text-forge-text-muted'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Technical System Diagnostics & Cryptographic Telemetry */}
      <div className="p-3 border-t border-forge-border bg-forge-bg/60 font-mono">
        <div className="p-2.5 rounded bg-forge-card/90 border border-forge-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-forge-emerald animate-pulse" />
              <span className="text-[10px] font-bold text-white tracking-wider">NODE SEC-04</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-forge-panel border border-forge-border text-forge-cyan font-bold">
              v4.2.0
            </span>
          </div>
          <div className="text-[9px] text-forge-text-muted space-y-0.5">
            <div className="flex justify-between">
              <span>LEDGER:</span>
              <span className="text-forge-emerald font-semibold">SYNCHRONIZED</span>
            </div>
            <div className="flex justify-between">
              <span>ENCLAVE:</span>
              <span className="text-forge-text-secondary">AIR-GAPPED (TLS 1.3)</span>
            </div>
            <div className="flex justify-between">
              <span>HASH ALGO:</span>
              <span className="text-forge-cyan">SHA-256 / MERKLE</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
