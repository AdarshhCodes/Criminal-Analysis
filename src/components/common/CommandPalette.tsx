import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FolderOpen,
  UserSearch,
  Sparkles,
  FileText,
  Bell,
  Layers,
  Clock,
  Bot,
  Shield,
  CornerDownLeft,
  X,
  Compass,
} from 'lucide-react';
import { useInvestigationStore } from '../../stores';
import { investigationService, GraphLayoutName } from '../../services';
import { Entity } from '../../types';

interface PaletteCommand {
  id: string;
  category: 'NAVIGATION' | 'GRAPH_LAYOUT' | 'WORKFLOW' | 'ENTITY';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  badge?: string;
  riskScore?: number;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    currentCase,
    cases,
    selectCase,
    selectEntity,
    setGraphLayout,
    traceIntelligencePath,
  } = useInvestigationStore();

  // Listen for global keyboard shortcut CTRL/CMD + K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Get case entities for live search
  const entities = useMemo(() => {
    return investigationService.getEntities(currentCase.id);
  }, [currentCase.id]);

  // Base list of workflow commands
  const baseCommands: PaletteCommand[] = useMemo(() => [
    // Workflow / Investigation commands
    {
      id: 'cmd-find-rel',
      category: 'WORKFLOW',
      title: 'Find Relationship (AI Intelligence Path)',
      subtitle: 'Analyze shortest evidentiary path between Rajesh Kumar & Amit Sharma',
      icon: <Sparkles className="w-4 h-4 text-forge-cyan" />,
      shortcut: 'PATH',
      action: () => {
        traceIntelligencePath('IF-P-001', 'IF-P-007');
        navigate('/graph');
      },
    },
    {
      id: 'cmd-generate-report',
      category: 'WORKFLOW',
      title: 'Generate Investigation Report',
      subtitle: 'Compile court-ready Section 65B forensic prosecution brief',
      icon: <FileText className="w-4 h-4 text-forge-emerald" />,
      shortcut: 'REPORT',
      action: () => {
        navigate('/reports');
      },
    },
    {
      id: 'cmd-open-copilot',
      category: 'WORKFLOW',
      title: 'Open AI Copilot',
      subtitle: 'Query synthetic investigation graph via natural language intelligence',
      icon: <Bot className="w-4 h-4 text-forge-cyan" />,
      action: () => {
        navigate('/ai');
      },
    },

    // Navigation commands
    {
      id: 'cmd-nav-graph',
      category: 'NAVIGATION',
      title: 'Open Network Graph',
      subtitle: 'Interactive Cytoscape link analysis workspace',
      icon: <Compass className="w-4 h-4 text-forge-cyan" />,
      action: () => {
        navigate('/graph');
      },
    },
    {
      id: 'cmd-nav-evidence',
      category: 'NAVIGATION',
      title: 'Open Evidence Repository',
      subtitle: 'Explore seized digital exhibits, CCTV, wiretaps, and Section 65B hashes',
      icon: <Shield className="w-4 h-4 text-forge-amber" />,
      action: () => {
        navigate('/evidence');
      },
    },
    {
      id: 'cmd-nav-alerts',
      category: 'NAVIGATION',
      title: 'Open Active Threat Alerts',
      subtitle: 'Review high-priority syndicate telemetry flags',
      icon: <Bell className="w-4 h-4 text-forge-rose" />,
      action: () => {
        navigate('/alerts');
      },
    },
    {
      id: 'cmd-nav-timeline',
      category: 'NAVIGATION',
      title: 'Toggle Timeline Investigation',
      subtitle: 'Chronological timeline of call intercepts and physical sightings',
      icon: <Clock className="w-4 h-4 text-forge-text-secondary" />,
      action: () => {
        navigate('/timeline');
      },
    },
    {
      id: 'cmd-nav-command',
      category: 'NAVIGATION',
      title: 'Open Command Centre',
      subtitle: 'Operational dashboard, key metrics, and review queue',
      icon: <FolderOpen className="w-4 h-4 text-forge-cyan" />,
      action: () => {
        navigate('/command-centre');
      },
    },

    // Graph Layout Switches
    {
      id: 'cmd-layout-cose',
      category: 'GRAPH_LAYOUT',
      title: 'Switch Graph Layout: Organic (COSE)',
      subtitle: 'Force-directed spring layout optimizing cluster separation',
      icon: <Layers className="w-4 h-4 text-forge-text-muted" />,
      action: () => {
        setGraphLayout('cose' as GraphLayoutName);
        navigate('/graph');
      },
    },
    {
      id: 'cmd-layout-breadthfirst',
      category: 'GRAPH_LAYOUT',
      title: 'Switch Graph Layout: Hierarchical',
      subtitle: 'Tree hierarchy from kingpin roots to street-level couriers',
      icon: <Layers className="w-4 h-4 text-forge-text-muted" />,
      action: () => {
        setGraphLayout('breadthfirst' as GraphLayoutName);
        navigate('/graph');
      },
    },
    {
      id: 'cmd-layout-concentric',
      category: 'GRAPH_LAYOUT',
      title: 'Switch Graph Layout: Radial (Risk Concentric)',
      subtitle: 'Concentric risk orbits placing highest-threat targets at centre',
      icon: <Layers className="w-4 h-4 text-forge-text-muted" />,
      action: () => {
        setGraphLayout('concentric' as GraphLayoutName);
        navigate('/graph');
      },
    },
    {
      id: 'cmd-layout-circle',
      category: 'GRAPH_LAYOUT',
      title: 'Switch Graph Layout: Circular',
      subtitle: 'Perimeter ring view for dense connection inspection',
      icon: <Layers className="w-4 h-4 text-forge-text-muted" />,
      action: () => {
        setGraphLayout('circle' as GraphLayoutName);
        navigate('/graph');
      },
    },

    // Case Selection commands
    ...cases.map((c) => ({
      id: `cmd-case-${c.id}`,
      category: 'WORKFLOW' as const,
      title: `Switch Case: ${c.name.split(':')[0]} (${c.code})`,
      subtitle: `${c.assignedUnit} · Priority: ${c.priority}`,
      icon: <FolderOpen className="w-4 h-4 text-forge-amber" />,
      action: () => {
        selectCase(c.id);
        navigate('/command-centre');
      },
    })),
  ], [cases, traceIntelligencePath, navigate, selectCase, setGraphLayout]);

  // Entity commands based on current case
  const entityCommands: PaletteCommand[] = useMemo(() => {
    return entities.map((e: Entity) => ({
      id: `cmd-entity-${e.id}`,
      category: 'ENTITY' as const,
      title: `${e.name} (${e.id})`,
      subtitle: `${e.role || e.type} · ${e.primaryIdentifier || 'Identifier Pending'}`,
      icon: <UserSearch className="w-4 h-4 text-forge-cyan" />,
      badge: e.type,
      riskScore: e.riskScore,
      action: () => {
        selectEntity(e);
        navigate('/graph');
      },
    }));
  }, [entities, selectEntity, navigate]);

  // Combined filtered commands
  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return baseCommands;
    }

    const matchedBase = baseCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q))
    );

    const matchedEntities = entityCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q))
    );

    return [...matchedEntities.slice(0, 8), ...matchedBase];
  }, [query, baseCommands, entityCommands]);

  // Keyboard navigation within list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredCommands[selectedIndex];
      if (target) {
        target.action();
        setIsOpen(false);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-forge-card border border-forge-cyan/40 rounded-xl shadow-2xl overflow-hidden font-mono flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-forge-border bg-forge-panel/90">
          <Search className="w-5 h-5 text-forge-cyan mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search entities, suspect names, phone lines, cases... (ESC to close)"
            className="w-full bg-transparent text-sm text-white placeholder:text-forge-text-muted focus:outline-none font-sans"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-forge-bg text-forge-text-muted hover:text-white transition ml-2 shrink-0"
            title="Close Command Palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-forge-border/20">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  data-index={idx}
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition ${
                    isSelected
                      ? 'bg-forge-cyan/15 text-white border-l-2 border-l-forge-cyan pl-2'
                      : 'text-forge-text-secondary hover:bg-forge-bg hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`p-2 rounded border ${
                        isSelected
                          ? 'bg-forge-cyan/20 border-forge-cyan/40'
                          : 'bg-forge-bg border-forge-border'
                      }`}
                    >
                      {cmd.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white truncate font-sans">
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-forge-panel border border-forge-border text-forge-cyan">
                            {cmd.badge}
                          </span>
                        )}
                        {cmd.riskScore !== undefined && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              cmd.riskScore >= 75
                                ? 'bg-forge-rose/20 text-forge-rose'
                                : 'bg-forge-amber/20 text-forge-amber'
                            }`}
                          >
                            {cmd.riskScore}/100
                          </span>
                        )}
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-forge-text-muted truncate mt-0.5 font-sans">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                    {cmd.shortcut && (
                      <kbd className="hidden sm:inline px-1.5 py-0.5 text-[9px] font-mono bg-forge-panel border border-forge-border rounded text-forge-text-muted">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-forge-cyan" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-forge-text-muted space-y-2">
              <Search className="w-8 h-8 mx-auto text-forge-border" />
              <p className="text-xs font-semibold text-white">No commands or entities found</p>
              <p className="text-[11px]">Try searching for &quot;Rajesh&quot;, &quot;Report&quot;, &quot;Layout&quot;, or &quot;Evidence&quot;</p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 bg-forge-panel/90 border-t border-forge-border text-[10px] text-forge-text-muted flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1 py-0.2 bg-forge-bg rounded border border-forge-border text-forge-text-secondary">↑</kbd>
              <kbd className="px-1 py-0.2 bg-forge-bg rounded border border-forge-border text-forge-text-secondary">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.2 bg-forge-bg rounded border border-forge-border text-forge-text-secondary">↵</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.2 bg-forge-bg rounded border border-forge-border text-forge-text-secondary">ESC</kbd>
              <span>to dismiss</span>
            </span>
          </div>

          <div className="text-forge-cyan font-semibold">
            INTEL-FORGE COMMAND PALETTE
          </div>
        </div>
      </div>
    </div>
  );
};
