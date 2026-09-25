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
          {/* Active Case Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCaseMenuOpen(!isCaseMenuOpen)}
              className="flex items-center space-x-2 bg-forge-card hover:bg-forge-cardHover border border-forge-border rounded px-3 py-1.5 text-left transition"
            >
              <div>
                <div className="text-[9px] font-mono text-forge-cyan leading-none">ACTIVE CASE</div>
                <div className="text-xs font-semibold text-white max-w-[140px] truncate">
                  {currentCase.name.split(':')[0]}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-forge-text-muted" />
            </button>

            {isCaseMenuOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-forge-card border border-forge-border rounded-md shadow-panel p-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-mono text-forge-text-muted border-b border-forge-border">
                  SELECT INVESTIGATION FILE
                </div>
                {cases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      selectCase(c.id);
                      setIsCaseMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition ${
                      c.id === currentCase.id
                        ? 'bg-forge-cyan/15 text-forge-cyan font-medium border border-forge-cyan/30'
                        : 'text-forge-text-secondary hover:bg-forge-bg hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{c.code}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                          c.priority === 'CRITICAL'
                            ? 'bg-forge-rose/20 text-forge-rose'
                            : 'bg-forge-amber/20 text-forge-amber'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </div>
                    <div className="text-[11px] text-forge-text-muted truncate mt-0.5">{c.name}</div>
                  </button>
                ))}
              </div>
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
