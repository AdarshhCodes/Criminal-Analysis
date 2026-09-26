/**
 * INTEL-FORGE Design System: Visual Severity & Category Color Tokens
 * 
 * Standardized color system providing distinct shades and tints for:
 * 1. Threat & Alert Severity Levels (Low, Medium, High, Critical)
 * 2. Case Statuses (Active, Under Review, Closed)
 * 3. Person / Entity Role Categories (Kingpin, Financial, Courier, Technical, Witness, Suspect)
 * 4. Case Flags (Women-Related, Critical, Financial, Cyber, Narcotics)
 * 
 * Reused consistently across tables, badges, graph overlays, and crime statistic charts.
 */

import { AlertSeverity, CasePriority, CaseStatus, CaseFlag } from '../types';

export interface ColorTokenConfig {
  label: string;
  badgeClasses: string;
  dotColor: string;
  hex: string;
  chartHex: string;
  subtleBg: string;
  borderClass: string;
  textColor: string;
}

// ---------------------------------------------------------------------------
// 1. Threat & Alert Severity Levels
// ---------------------------------------------------------------------------
export const SEVERITY_CONFIG: Record<AlertSeverity, ColorTokenConfig> = {
  LOW: {
    label: 'Low',
    badgeClasses: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    hex: '#10b981',
    chartHex: '#10b981',
    subtleBg: 'bg-emerald-950/20',
    borderClass: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
  },
  MEDIUM: {
    label: 'Medium',
    badgeClasses: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    dotColor: 'bg-sky-400',
    hex: '#0ea5e9',
    chartHex: '#0ea5e9',
    subtleBg: 'bg-sky-950/20',
    borderClass: 'border-sky-500/30',
    textColor: 'text-sky-400',
  },
  HIGH: {
    label: 'High',
    badgeClasses: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    dotColor: 'bg-amber-400',
    hex: '#f59e0b',
    chartHex: '#f59e0b',
    subtleBg: 'bg-amber-950/20',
    borderClass: 'border-amber-500/30',
    textColor: 'text-amber-400',
  },
  CRITICAL: {
    label: 'Critical',
    badgeClasses: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
    dotColor: 'bg-rose-400 animate-pulse',
    hex: '#f43f5e',
    chartHex: '#f43f5e',
    subtleBg: 'bg-rose-950/30',
    borderClass: 'border-rose-500/40',
    textColor: 'text-rose-400',
  },
};

// ---------------------------------------------------------------------------
// 2. Case Statuses
// ---------------------------------------------------------------------------
export const CASE_STATUS_CONFIG: Record<CaseStatus, ColorTokenConfig> = {
  ACTIVE: {
    label: 'Active',
    badgeClasses: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    dotColor: 'bg-emerald-400 animate-pulse',
    hex: '#10b981',
    chartHex: '#10b981',
    subtleBg: 'bg-emerald-950/20',
    borderClass: 'border-emerald-500/30',
    textColor: 'text-emerald-300',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    badgeClasses: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    dotColor: 'bg-cyan-400',
    hex: '#06b6d4',
    chartHex: '#06b6d4',
    subtleBg: 'bg-cyan-950/20',
    borderClass: 'border-cyan-500/30',
    textColor: 'text-cyan-300',
  },
  CLOSED: {
    label: 'Closed',
    badgeClasses: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
    dotColor: 'bg-slate-400',
    hex: '#64748b',
    chartHex: '#64748b',
    subtleBg: 'bg-slate-900/40',
    borderClass: 'border-slate-500/30',
    textColor: 'text-slate-300',
  },
};

// ---------------------------------------------------------------------------
// 3. Person / Entity Role Categories
// ---------------------------------------------------------------------------
export type RoleCategory =
  | 'LEADERSHIP'
  | 'FINANCIAL'
  | 'OPERATIONS'
  | 'TECHNICAL'
  | 'PROTECTED_WITNESS'
  | 'SUSPECT';

export const ROLE_CATEGORY_CONFIG: Record<RoleCategory, ColorTokenConfig> = {
  LEADERSHIP: {
    label: 'Syndicate Leadership',
    badgeClasses: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    dotColor: 'bg-purple-400',
    hex: '#a855f7',
    chartHex: '#a855f7',
    subtleBg: 'bg-purple-950/20',
    borderClass: 'border-purple-500/30',
    textColor: 'text-purple-300',
  },
  FINANCIAL: {
    label: 'Financial Controller',
    badgeClasses: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    dotColor: 'bg-cyan-400',
    hex: '#06b6d4',
    chartHex: '#06b6d4',
    subtleBg: 'bg-cyan-950/20',
    borderClass: 'border-cyan-500/30',
    textColor: 'text-cyan-300',
  },
  OPERATIONS: {
    label: 'Logistics & Courier',
    badgeClasses: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    dotColor: 'bg-blue-400',
    hex: '#3b82f6',
    chartHex: '#3b82f6',
    subtleBg: 'bg-blue-950/20',
    borderClass: 'border-blue-500/30',
    textColor: 'text-blue-300',
  },
  TECHNICAL: {
    label: 'Technical / SIM Reseller',
    badgeClasses: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    dotColor: 'bg-indigo-400',
    hex: '#6366f1',
    chartHex: '#6366f1',
    subtleBg: 'bg-indigo-950/20',
    borderClass: 'border-indigo-500/30',
    textColor: 'text-indigo-300',
  },
  PROTECTED_WITNESS: {
    label: 'Protected Witness / Complainant',
    badgeClasses: 'bg-teal-500/15 text-teal-300 border border-teal-500/30',
    dotColor: 'bg-teal-400',
    hex: '#14b8a6',
    chartHex: '#14b8a6',
    subtleBg: 'bg-teal-950/20',
    borderClass: 'border-teal-500/30',
    textColor: 'text-teal-300',
  },
  SUSPECT: {
    label: 'Suspect',
    badgeClasses: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    dotColor: 'bg-rose-400',
    hex: '#f43f5e',
    chartHex: '#f43f5e',
    subtleBg: 'bg-rose-950/20',
    borderClass: 'border-rose-500/30',
    textColor: 'text-rose-300',
  },
};

// ---------------------------------------------------------------------------
// 4. Case Flags
// ---------------------------------------------------------------------------
export const CASE_FLAG_CONFIG: Record<CaseFlag, ColorTokenConfig> = {
  WOMEN_RELATED: {
    label: 'Women-Related Case',
    badgeClasses: 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-sm font-semibold',
    dotColor: 'bg-rose-400 animate-pulse',
    hex: '#fb7185',
    chartHex: '#fb7185',
    subtleBg: 'bg-rose-950/40',
    borderClass: 'border-rose-500/40',
    textColor: 'text-rose-300',
  },
  CRITICAL: {
    label: 'Critical Priority',
    badgeClasses: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold',
    dotColor: 'bg-rose-400',
    hex: '#f43f5e',
    chartHex: '#f43f5e',
    subtleBg: 'bg-rose-950/30',
    borderClass: 'border-rose-500/40',
    textColor: 'text-rose-300',
  },
  FINANCIAL: {
    label: 'Financial Crime',
    badgeClasses: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    dotColor: 'bg-cyan-400',
    hex: '#06b6d4',
    chartHex: '#06b6d4',
    subtleBg: 'bg-cyan-950/20',
    borderClass: 'border-cyan-500/30',
    textColor: 'text-cyan-300',
  },
  CYBER: {
    label: 'Cyber Crime',
    badgeClasses: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    dotColor: 'bg-indigo-400',
    hex: '#6366f1',
    chartHex: '#6366f1',
    subtleBg: 'bg-indigo-950/20',
    borderClass: 'border-indigo-500/30',
    textColor: 'text-indigo-300',
  },
  NARCOTICS: {
    label: 'Narcotics',
    badgeClasses: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    dotColor: 'bg-amber-400',
    hex: '#f59e0b',
    chartHex: '#f59e0b',
    subtleBg: 'bg-amber-950/20',
    borderClass: 'border-amber-500/30',
    textColor: 'text-amber-300',
  },
  ORGANIZED_CRIME: {
    label: 'Organized Crime',
    badgeClasses: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    dotColor: 'bg-purple-400',
    hex: '#a855f7',
    chartHex: '#a855f7',
    subtleBg: 'bg-purple-950/20',
    borderClass: 'border-purple-500/30',
    textColor: 'text-purple-300',
  },
  INTERSTATE: {
    label: 'Inter-State Jurisdiction',
    badgeClasses: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
    dotColor: 'bg-sky-400',
    hex: '#38bdf8',
    chartHex: '#38bdf8',
    subtleBg: 'bg-sky-950/20',
    borderClass: 'border-sky-500/30',
    textColor: 'text-sky-300',
  },
};

// ---------------------------------------------------------------------------
// 5. Person Classifications (Victim, Suspect, Witness, Accused)
// ---------------------------------------------------------------------------
export type PersonClassification = 'VICTIM' | 'SUSPECT' | 'WITNESS' | 'ACCUSED';

export const PERSON_CLASSIFICATION_CONFIG: Record<PersonClassification, ColorTokenConfig> = {
  VICTIM: {
    label: 'Victim',
    badgeClasses: 'bg-teal-500/15 text-teal-300 border border-teal-500/30',
    dotColor: 'bg-teal-400',
    hex: '#14b8a6',
    chartHex: '#14b8a6',
    subtleBg: 'bg-teal-950/20',
    borderClass: 'border-teal-500/30',
    textColor: 'text-teal-300',
  },
  SUSPECT: {
    label: 'Suspect',
    badgeClasses: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    dotColor: 'bg-rose-400',
    hex: '#f43f5e',
    chartHex: '#f43f5e',
    subtleBg: 'bg-rose-950/20',
    borderClass: 'border-rose-500/30',
    textColor: 'text-rose-300',
  },
  WITNESS: {
    label: 'Witness',
    badgeClasses: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
    dotColor: 'bg-sky-400',
    hex: '#38bdf8',
    chartHex: '#38bdf8',
    subtleBg: 'bg-sky-950/20',
    borderClass: 'border-sky-500/30',
    textColor: 'text-sky-300',
  },
  ACCUSED: {
    label: 'Accused',
    badgeClasses: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    dotColor: 'bg-amber-400',
    hex: '#f59e0b',
    chartHex: '#f59e0b',
    subtleBg: 'bg-amber-950/20',
    borderClass: 'border-amber-500/30',
    textColor: 'text-amber-300',
  },
};

// ---------------------------------------------------------------------------
// 6. Highlight & General Status (Important, Active, Under Review, Closed)
// ---------------------------------------------------------------------------
export const IMPORTANT_CONFIG: ColorTokenConfig = {
  label: 'Important',
  badgeClasses: 'bg-violet-500/15 text-violet-300 border border-violet-500/30 font-semibold',
  dotColor: 'bg-violet-400',
  hex: '#8b5cf6',
  chartHex: '#8b5cf6',
  subtleBg: 'bg-violet-950/20',
  borderClass: 'border-violet-500/30',
  textColor: 'text-violet-300',
};

// ---------------------------------------------------------------------------
// Helper Lookup Functions
// ---------------------------------------------------------------------------
export function getSeverityConfig(severity?: string | CasePriority | AlertSeverity): ColorTokenConfig {
  if (!severity) return SEVERITY_CONFIG.LOW;
  const upper = severity.toUpperCase() as AlertSeverity;
  return SEVERITY_CONFIG[upper] || SEVERITY_CONFIG.LOW;
}

export function getCaseStatusConfig(status?: string | CaseStatus): ColorTokenConfig {
  if (!status) return CASE_STATUS_CONFIG.ACTIVE;
  const upper = status.toUpperCase() as CaseStatus;
  return CASE_STATUS_CONFIG[upper] || CASE_STATUS_CONFIG.ACTIVE;
}

export function getPersonClassificationConfig(classification?: string | PersonClassification): ColorTokenConfig {
  if (!classification) return PERSON_CLASSIFICATION_CONFIG.SUSPECT;
  const upper = classification.toUpperCase() as PersonClassification;
  return PERSON_CLASSIFICATION_CONFIG[upper] || PERSON_CLASSIFICATION_CONFIG.SUSPECT;
}

export function getCaseFlagConfig(flag: CaseFlag | string): ColorTokenConfig {
  const upper = flag.toUpperCase() as CaseFlag;
  return CASE_FLAG_CONFIG[upper] || {
    label: flag,
    badgeClasses: 'bg-forge-card text-forge-text-secondary border border-forge-border',
    dotColor: 'bg-forge-text-muted',
    hex: '#94a3b8',
    chartHex: '#94a3b8',
    subtleBg: 'bg-forge-bg',
    borderClass: 'border-forge-border',
    textColor: 'text-forge-text-secondary',
  };
}

export function classifyRoleCategory(role?: string): RoleCategory {
  if (!role) return 'SUSPECT';
  const r = role.toLowerCase();
  if (r.includes('kingpin') || r.includes('head') || r.includes('mastermind') || r.includes('admin') || r.includes('leader')) {
    return 'LEADERSHIP';
  }
  if (r.includes('hawala') || r.includes('finance') || r.includes('cash') || r.includes('mule') || r.includes('account') || r.includes('escrow') || r.includes('remittance')) {
    return 'FINANCIAL';
  }
  if (r.includes('courier') || r.includes('runner') || r.includes('logistics') || r.includes('driver') || r.includes('transport') || r.includes('cargo')) {
    return 'OPERATIONS';
  }
  if (r.includes('sim') || r.includes('tech') || r.includes('cyber') || r.includes('developer') || r.includes('voip') || r.includes('forgery')) {
    return 'TECHNICAL';
  }
  if (r.includes('witness') || r.includes('victim') || r.includes('complainant') || r.includes('cleared')) {
    return 'PROTECTED_WITNESS';
  }
  return 'SUSPECT';
}

export function getRoleCategoryConfig(role?: string): ColorTokenConfig {
  const category = classifyRoleCategory(role);
  return ROLE_CATEGORY_CONFIG[category];
}

