import React from 'react';
import {
  getSeverityConfig,
  getCaseStatusConfig,
  getCaseFlagConfig,
  getRoleCategoryConfig,
  getPersonClassificationConfig,
} from '../../lib/severitySystem';
import { AlertSeverity, CasePriority, CaseStatus, CaseFlag } from '../../types';
import { ShieldAlert, AlertCircle, HeartHandshake } from 'lucide-react';

interface SeverityBadgeProps {
  level: AlertSeverity | CasePriority | string;
  showDot?: boolean;
  className?: string;
  size?: 'xs' | 'sm';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  level,
  showDot = true,
  className = '',
  size = 'xs',
}) => {
  const config = getSeverityConfig(level);
  const sizeClasses = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded font-mono font-bold uppercase tracking-wider ${config.badgeClasses} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`} />}
      <span>{config.label}</span>
    </span>
  );
};

interface CaseStatusBadgeProps {
  status: CaseStatus | string;
  showDot?: boolean;
  className?: string;
  size?: 'xs' | 'sm';
}

export const CaseStatusBadge: React.FC<CaseStatusBadgeProps> = ({
  status,
  showDot = true,
  className = '',
  size = 'xs',
}) => {
  const config = getCaseStatusConfig(status);
  const sizeClasses = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded font-mono font-bold uppercase tracking-wider ${config.badgeClasses} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`} />}
      <span>{config.label}</span>
    </span>
  );
};

interface CaseFlagBadgeProps {
  flag: CaseFlag | string;
  className?: string;
  size?: 'xs' | 'sm';
}

export const CaseFlagBadge: React.FC<CaseFlagBadgeProps> = ({
  flag,
  className = '',
  size = 'xs',
}) => {
  const config = getCaseFlagConfig(flag);
  const sizeClasses = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  const isWomenRelated = flag === 'WOMEN_RELATED' || flag.toLowerCase().includes('women');

  return (
    <span
      className={`inline-flex items-center space-x-1 rounded font-mono font-medium ${config.badgeClasses} ${sizeClasses} ${className}`}
      title={config.label}
    >
      {isWomenRelated ? (
        <HeartHandshake className="w-3 h-3 shrink-0 text-rose-400" />
      ) : flag === 'CRITICAL' ? (
        <ShieldAlert className="w-3 h-3 shrink-0 text-rose-400" />
      ) : (
        <AlertCircle className="w-3 h-3 shrink-0 opacity-70" />
      )}
      <span>{config.label}</span>
    </span>
  );
};

interface EntityRoleBadgeProps {
  role?: string;
  className?: string;
  size?: 'xs' | 'sm';
}

export const EntityRoleBadge: React.FC<EntityRoleBadgeProps> = ({
  role,
  className = '',
  size = 'xs',
}) => {
  if (!role) return null;
  const config = getRoleCategoryConfig(role);
  const sizeClasses = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center space-x-1 rounded font-sans font-medium truncate ${config.badgeClasses} ${sizeClasses} ${className}`}
      title={role}
    >
      <span className="truncate">{role}</span>
    </span>
  );
};

interface PersonClassificationBadgeProps {
  classification?: 'VICTIM' | 'SUSPECT' | 'WITNESS' | 'ACCUSED' | string;
  showDot?: boolean;
  className?: string;
  size?: 'xs' | 'sm';
}

export const PersonClassificationBadge: React.FC<PersonClassificationBadgeProps> = ({
  classification,
  showDot = true,
  className = '',
  size = 'xs',
}) => {
  if (!classification) return null;
  const config = getPersonClassificationConfig(classification);
  const sizeClasses = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded font-mono font-bold uppercase tracking-wider ${config.badgeClasses} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`} />}
      <span>{config.label}</span>
    </span>
  );
};

interface ImportantBadgeProps {
  label?: string;
  className?: string;
  size?: 'xs' | 'sm';
}

export const ImportantBadge: React.FC<ImportantBadgeProps> = ({
  label = 'Important',
  className = '',
  size = 'xs',
}) => {
  const sizeClasses = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded font-mono font-bold uppercase tracking-wider bg-violet-500/15 text-violet-300 border border-violet-500/30 ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-violet-400" />
      <span>{label}</span>
    </span>
  );
};

