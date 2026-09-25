import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Search,
  ChevronDown,
  Activity,
  Bell,
  UserCheck,
  Lock,
  Database,
  Sun,
  Moon,
} from 'lucide-react';
import { useInvestigationStore, useThemeStore } from '../../stores';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentCase, cases, selectCase, currentInvestigator, runAiQuery } =
    useInvestigationStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isCaseMenuOpen, setIsCaseMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      runAiQuery(searchInput.trim());
      if (location.pathname !== '/graph' && location.pathname !== '/ai') {
        navigate('/graph');
      }
    }
  };

  return (
    <header className="flex flex-col bg-forge-panel border-b border-forge-border select-none z-30">
      {/* Top Demo & Security Telemetry Ticker */}
      <div className="bg-forge-bg/95 px-4 py-1 flex items-center justify-between text-[11px] border-b border-forge-border/60">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-forge-cyan">
            <span className="w-2 h-2 rounded-full bg-forge-emerald animate-pulse" />
            <span className="font-mono font-medium tracking-wider uppercase">
              DEMO ENVIRONMENT · SYNTHETIC INVESTIGATION DATA
            </span>
          </div>
          <span className="text-forge-border">|</span>
          <span className="font-mono text-forge-text-muted hidden md:inline">
            ENCLAVE: SEC-DEL-04 // CRYPTO-HASHCHAIN ACTIVE (SHA-256)
          </span>
        </div>

        {/* Security & Access Badges */}
        <div className="flex items-center space-x-3 font-mono text-[10px] text-forge-text-muted">
          <div className="flex items-center space-x-1 bg-forge-card px-2 py-0.5 rounded border border-forge-border">
            <UserCheck className="w-3 h-3 text-forge-cyan" />
            <span className="text-forge-text-secondary">ROLE: SENIOR INVESTIGATOR</span>
          </div>
          <div className="flex items-center space-x-1 bg-forge-card px-2 py-0.5 rounded border border-forge-border hidden sm:flex">
            <Lock className="w-3 h-3 text-forge-amber" />
            <span className="text-forge-text-secondary">ACCESS: CASE LEVEL</span>
          </div>
          <div className="flex items-center space-x-1 bg-forge-card px-2 py-0.5 rounded border border-forge-border hidden lg:flex">
            <Database className="w-3 h-3 text-forge-emerald" />
            <span className="text-forge-text-secondary">AUDIT: SHA-256 LEDGER ON</span>
          </div>
          <div className="flex items-center space-x-1 text-forge-emerald">
            <Activity className="w-3 h-3" />
            <span>SYS_ONLINE (14ms)</span>
          </div>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="px-5 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-2 rounded bg-forge-cyan/10 border border-forge-cyan/30 text-forge-cyan shadow-cyan-glow">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-wider text-base text-white font-mono">INTEL-FORGE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/40">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[10px] tracking-wide text-forge-text-muted uppercase font-mono hidden sm:block">
              Forging Insights From Every Connection
            </p>
          </div>
        </div>

        {/* Global Investigation Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-forge-cyan absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ask Intel-Forge about this investigation... (e.g. 'Show strongest connection between Rajesh Kumar and Amit Sharma')"
              className="w-full bg-forge-bg/90 border border-forge-border rounded-md pl-9 pr-20 py-1.5 text-xs text-forge-text-primary placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan focus:ring-1 focus:ring-forge-cyan transition"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
                }}
                className="px-1.5 py-0.5 text-[9px] font-mono bg-forge-card hover:bg-forge-panel rounded border border-forge-border text-forge-cyan hover:text-white transition flex items-center space-x-0.5"
                title="Open Command Palette (Ctrl+K)"
              >
                <span>⌘K</span>
              </button>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-[9px] font-mono bg-forge-card rounded border border-forge-border text-forge-text-muted">
                ↵ Enter
              </kbd>
            </div>
          </div>
        </form>

        {/* Case Switcher & Officer Profile */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Active Case Selector / Case Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsCaseMenuOpen(!isCaseMenuOpen)}
              className="flex items-center space-x-2 bg-forge-card hover:bg-forge-cardHover border border-forge-border rounded px-3 py-1.5 text-left transition shadow-sm"
              title="Switch Investigation Case or Executive Portfolio View"
            >
              <div>
                <div className="text-[9px] font-mono text-forge-cyan leading-none font-semibold">
                  {currentCase.id === 'ALL' ? 'PORTFOLIO VIEW' : 'ACTIVE CASE'}
                </div>
                <div className="text-xs font-semibold text-white max-w-[160px] truncate">
                  {currentCase.id === 'ALL' ? 'All Operations' : currentCase.name.split(':')[0]}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-forge-text-muted transition-transform duration-200 ${isCaseMenuOpen ? 'rotate-180 text-forge-cyan' : ''}`} />
            </button>

            {isCaseMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCaseMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-80 bg-forge-card border border-forge-border rounded-lg shadow-2xl p-1.5 z-50 divide-y divide-forge-border/50">
                  <div className="px-3 py-2">
                    <div className="text-[10px] font-mono text-forge-cyan uppercase tracking-wider font-bold">
                      CASE SWITCHER · CENTRAL INTELLIGENCE
                    </div>
                    <p className="text-[10px] text-forge-text-muted mt-0.5">
                      Select a single case or view the multi-case executive portfolio.
                    </p>
                  </div>

                  {/* Option 1: Consolidated All Cases */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        selectCase('ALL');
                        setIsCaseMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs transition ${
                        currentCase.id === 'ALL'
                          ? 'bg-forge-cyan/20 text-white font-medium border border-forge-cyan/40 shadow-sm'
                          : 'text-forge-text-secondary hover:bg-forge-bg hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center space-x-1.5 text-white">
                          <span>🌐 All Cases (Executive Portfolio)</span>
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-forge-cyan/20 text-forge-cyan font-bold">
                          CONSOLIDATED
                        </span>
                      </div>
                      <div className="text-[11px] text-forge-text-muted mt-0.5">
                        High-level executive dashboard across all 4 criminal operations
                      </div>
                    </button>
                  </div>

                  {/* Individual Cases List */}
                  <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
                    <div className="px-3 py-1 text-[9px] font-mono text-forge-text-muted uppercase">
                      ACTIVE INVESTIGATION FILES ({cases.length})
                    </div>
                    {cases.map((c) => {
                      const isWomenRelated = c.caseFlags?.includes('WOMEN_RELATED');
                      const isSelected = currentCase.id === c.id;

                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            selectCase(c.id);
                            setIsCaseMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-xs transition ${
                            isSelected
                              ? 'bg-forge-cyan/15 text-forge-cyan font-medium border border-forge-cyan/40'
                              : 'text-forge-text-secondary hover:bg-forge-bg hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-white font-mono text-[11px]">{c.code}</span>
                            <div className="flex items-center space-x-1 shrink-0">
                              {isWomenRelated && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold">
                                  WOMEN
                                </span>
                              )}
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                  c.status === 'ACTIVE'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : c.status === 'UNDER_REVIEW'
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : 'bg-slate-500/20 text-slate-400'
                                }`}
                              >
                                {c.status}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                  c.priority === 'CRITICAL'
                                    ? 'bg-rose-500/20 text-rose-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {c.priority}
                              </span>
                            </div>
                          </div>
                          <div className="text-[11px] text-white font-medium truncate mt-1">{c.name}</div>
                          <div className="text-[10px] text-forge-text-muted truncate mt-0.5">
                            Lead: {c.leadInvestigator} · {c.metrics.totalEntities} entities
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications / Alerts Counter */}
          <div className="relative">
            <button
              onClick={() => navigate('/alerts')}
              className="p-2 rounded bg-forge-card border border-forge-border hover:bg-forge-cardHover text-forge-text-secondary hover:text-white transition"
              title="View Active Threat Alerts"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-forge-rose text-[9px] font-bold font-mono flex items-center justify-center text-white">
              {currentCase.alertCount}
            </span>
          </div>

          {/* Theme Toggle Button (Light / Dark Mode) */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-button"
            className="p-2 rounded bg-forge-card border border-forge-border hover:bg-forge-cardHover text-forge-text-secondary hover:text-forge-cyan transition flex items-center justify-center group"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-forge-amber group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-forge-cyan group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Officer Profile Badge */}
          <div className="hidden xl:flex items-center space-x-2 pl-2 border-l border-forge-border">
            <div className="w-7 h-7 rounded-full bg-forge-cyan/20 border border-forge-cyan/40 flex items-center justify-center font-mono text-xs text-forge-cyan font-bold">
              VR
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-medium text-white">{currentInvestigator.name}</div>
              <div className="text-[10px] font-mono text-forge-text-muted">{currentInvestigator.badge}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
