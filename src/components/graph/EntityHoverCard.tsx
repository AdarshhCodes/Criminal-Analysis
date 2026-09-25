import React from 'react';
import { Entity } from '../../types';

interface EntityHoverCardProps {
  entity: Entity | null;
  position: { x: number; y: number } | null;
}

export const EntityHoverCard: React.FC<EntityHoverCardProps> = ({ entity, position }) => {
  if (!entity || !position) return null;

  return (
    <div
      style={{
        left: `${position.x + 15}px`,
        top: `${position.y - 15}px`,
      }}
      className="fixed z-50 pointer-events-none bg-forge-card/95 backdrop-blur border border-forge-cyan/40 p-3 rounded-lg shadow-panel font-mono text-xs w-56 space-y-1.5 animate-fadeIn"
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/30 font-bold">
          {entity.type}
        </span>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            entity.riskScore >= 75
              ? 'bg-forge-rose/20 text-forge-rose'
              : 'bg-forge-amber/20 text-forge-amber'
          }`}
        >
          RISK: {entity.riskScore}/100
        </span>
      </div>

      <div className="font-bold text-white font-sans text-sm">{entity.name}</div>
      {entity.role && <div className="text-[10px] text-forge-cyan">{entity.role}</div>}

      {entity.primaryIdentifier && (
        <div className="text-[9px] text-forge-text-muted truncate pt-1 border-t border-forge-border/40">
          ID: {entity.primaryIdentifier}
        </div>
      )}
    </div>
  );
};
