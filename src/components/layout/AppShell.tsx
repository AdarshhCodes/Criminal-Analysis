import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { ContextPanel } from './ContextPanel';
import { EvidenceViewerModal } from '../evidence/EvidenceViewerModal';
import { CommandPalette } from '../common/CommandPalette';

export const AppShell: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-forge-bg text-forge-text-primary flex flex-col overflow-hidden font-sans select-none">
      {/* Universal Tactical Header */}
      <TopBar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Rail */}
        <Sidebar />

        {/* Central Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto bg-forge-bg tactical-grid flex flex-col relative focus:outline-none">
          <Outlet />
        </main>

        {/* Right Dynamic Contextual Dossier */}
        <ContextPanel />
      </div>

      {/* Global Forensic Evidence Modal */}
      <EvidenceViewerModal />

      {/* Global Enterprise Command Palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
};
