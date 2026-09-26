import React from 'react';
import {
  FolderKanban,
  ShieldAlert,
  Users,
  FileSearch,
  Clock,
  UserCheck,
  MapPin,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface ExecutiveKpiRibbonProps {
  activeCasesCount: number;
  criticalCasesCount: number;
  peopleCount: number;
  evidenceCount: number;
  recentActivityCount: number;
  connectionsCount: number;
  highRiskLocationsCount: number;
  pendingReviewsCount: number;
  onFilterClick?: (filterType: string) => void;
}

export const ExecutiveKpiRibbon: React.FC<ExecutiveKpiRibbonProps> = ({
  activeCasesCount,
  criticalCasesCount,
  peopleCount,
  evidenceCount,
  recentActivityCount,
  connectionsCount,
  highRiskLocationsCount,
  pendingReviewsCount,
  onFilterClick,
}) => {
  const cards = [
    {
      id: 'active-cases',
      title: 'Active Cases',
      value: activeCasesCount,
      subtext: 'Operational Files',
      icon: FolderKanban,
      color: 'cyan',
      textColor: 'text-forge-cyan',
      borderHover: 'hover:border-forge-cyan/60',
      badge: 'Active Focus',
    },
    {
      id: 'critical-cases',
      title: 'Critical Cases',
      value: criticalCasesCount,
      subtext: 'Urgent Intervention',
      icon: ShieldAlert,
      color: 'rose',
      textColor: 'text-forge-rose',
      borderHover: 'hover:border-forge-rose/60',
      badge: 'Hot Priority',
    },
    {
      id: 'people-investigation',
      title: 'People Monitored',
      value: peopleCount,
      subtext: 'Suspects & Persons',
      icon: Users,
      color: 'orange',
      textColor: 'text-amber-400',
      borderHover: 'hover:border-amber-400/60',
      badge: 'Profiled',
    },
    {
      id: 'open-evidence',
      title: 'Evidence Exhibits',
      value: evidenceCount,
      subtext: 'Sealed & Attested',
      icon: FileSearch,
      color: 'emerald',
      textColor: 'text-forge-emerald',
      borderHover: 'hover:border-forge-emerald/60',
      badge: 'Chain of Custody',
    },
    {
      id: 'recent-activity',
      title: 'Recent Activity',
      value: recentActivityCount,
      subtext: 'Events in 24h',
      icon: Clock,
      color: 'sky',
      textColor: 'text-sky-400',
      borderHover: 'hover:border-sky-400/60',
      badge: 'Timeline Feed',
    },
    {
      id: 'important-connections',
      title: 'Connections',
      value: connectionsCount,
      subtext: 'Graph Associations',
      icon: UserCheck,
      color: 'indigo',
      textColor: 'text-indigo-400',
      borderHover: 'hover:border-indigo-400/60',
      badge: 'Network Edges',
    },
    {
      id: 'high-risk-locations',
      title: 'Monitored Locations',
      value: highRiskLocationsCount,
      subtext: 'Surveillance Hubs',
      icon: MapPin,
      color: 'pink',
      textColor: 'text-pink-400',
      borderHover: 'hover:border-pink-400/60',
      badge: 'Tactical Grid',
    },
    {
      id: 'pending-reviews',
      title: 'Pending Reviews',
      value: pendingReviewsCount,
      subtext: 'AI Leads to Verify',
      icon: Sparkles,
      color: 'amber',
      textColor: 'text-forge-amber',
      borderHover: 'hover:border-forge-amber/60',
      badge: 'Action Needed',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono select-none">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onFilterClick && onFilterClick(card.id)}
            className={`p-3 rounded-xl bg-forge-card/90 border border-forge-border ${card.borderHover} transition flex flex-col justify-between cursor-pointer group shadow-sm`}
          >
            <div>
              <div className="flex items-center justify-between text-[10px] text-forge-text-muted">
                <span className="truncate">{card.title}</span>
                <Icon className={`w-3.5 h-3.5 ${card.textColor} group-hover:scale-110 transition shrink-0`} />
              </div>

              <div className={`text-xl font-bold ${card.textColor} mt-1.5 tracking-tight`}>
                {card.value}
              </div>
            </div>

            <div className="pt-2 border-t border-forge-border/40 mt-2 flex items-center justify-between text-[9px] text-forge-text-muted">
              <span className="truncate">{card.subtext}</span>
              <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition text-forge-text-secondary" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
