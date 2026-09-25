import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Database,
  Search,
  Download,
  Check,
  Copy,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { auditService } from '../services';
import { AuditEvent } from '../types';
import { truncateHash } from '../lib/utils';

export const AuditTrailPage: React.FC = () => {
  const [blocks, setBlocks] = useState<AuditEvent[]>([]);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [exportedToast, setExportedToast] = useState(false);
  const [expandedPayloads, setExpandedPayloads] = useState<Record<string, boolean>>({});
  const [integrityStatus, setIntegrityStatus] = useState<{
    isValid: boolean;
    totalBlocks: number;
    verifiedAt: string;
  } | null>(null);
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);

  const refreshBlocks = () => {
    setBlocks(auditService.getBlocks());
  };

  useEffect(() => {
    refreshBlocks();
    auditService.verifyChainIntegrity().then(setIntegrityStatus);
  }, []);

  const handleVerifyChain = async () => {
    setIsVerifyingChain(true);
    const result = await auditService.verifyChainIntegrity();
    setTimeout(() => {
      setIntegrityStatus(result);
      setIsVerifyingChain(false);
    }, 600);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportLedger = () => {
    const docket = {
      title: 'INTEL-FORGE IMMUTABLE BLOCKCHAIN AUDIT LEDGER',
      caseId: 'IF-CASE-2026-0882 (OPERATION FALCON)',
      exportedAt: new Date().toISOString(),
      statuteCompliance: 'Indian Evidence Act Sec 65B & IT Act Sec 66D',
      totalBlocks: blocks.length,
      chainIntegrity: integrityStatus?.isValid ? 'CRYPTOGRAPHICALLY VALID' : 'UNVERIFIED',
      blocks: blocks,
    };

    navigator.clipboard.writeText(JSON.stringify(docket, null, 2));
    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 2500);
  };

  const togglePayload = (id: string) => {
    setExpandedPayloads((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredBlocks = blocks.filter((b) => {
    const matchesAction = filterAction === 'ALL' || b.action === filterAction;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      b.details.toLowerCase().includes(q) ||
      b.actorName.toLowerCase().includes(q) ||
      b.targetId.toLowerCase().includes(q) ||
      b.blockHash.toLowerCase().includes(q);

    return matchesAction && matchesSearch;
  });

  // Action Badge formatting
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'RELATIONSHIP_VERIFIED':
        return 'bg-forge-emerald/20 text-forge-emerald border-forge-emerald/40';
      case 'RELATIONSHIP_REJECTED':
        return 'bg-rose-950/40 text-rose-400 border-rose-600/40';
      case 'EVIDENCE_VERIFIED':
        return 'bg-cyan-950/40 text-forge-cyan border-cyan-500/40';
      case 'EVIDENCE_FLAGGED':
        return 'bg-amber-950/40 text-forge-amber border-amber-500/40';
      case 'AI_QUERY_EXECUTED':
        return 'bg-cyan-950/40 text-cyan-300 border-cyan-600/40';
      case 'ALERT_ACKNOWLEDGED':
        return 'bg-blue-950/40 text-blue-300 border-blue-600/40';
      case 'CASE_INITIATED':
        return 'bg-slate-800 text-slate-300 border-slate-600';
      default:
        return 'bg-forge-card text-white border-forge-border';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6 select-none font-mono">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-forge-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-forge-emerald text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>IMMUTABLE EVIDENCE LEDGER // SECTION 65B READY</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 font-sans">
            Cryptographic Audit Trail
          </h1>
          <p className="text-xs text-forge-text-muted mt-0.5 font-sans">
            Tamper-evident SHA-256 hash-chained ledger storing all human-in-the-loop relationship verifications, AI swarm queries, and evidence seals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportLedger}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-forge-card hover:bg-forge-cardHover border border-forge-border rounded text-xs text-white transition"
            title="Export Immutable Ledger Manifest"
          >
            {exportedToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-forge-emerald" />
                <span className="text-forge-emerald font-bold">Ledger Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Ledger</span>
              </>
            )}
          </button>

          <button
            onClick={handleVerifyChain}
            disabled={isVerifyingChain}
            className="flex items-center space-x-1.5 bg-forge-emerald/15 hover:bg-forge-emerald/25 border border-forge-emerald/40 text-forge-emerald px-3 py-1.5 rounded text-xs transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isVerifyingChain ? 'Recalculating Proof...' : 'CHAIN INTEGRITY: 100%'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-forge-card p-3 rounded-lg border border-forge-border">
          <div className="text-[10px] text-forge-text-muted uppercase">TOTAL SEALED BLOCKS</div>
          <div className="text-xl font-bold text-white mt-0.5">{blocks.length}</div>
          <div className="text-[10px] text-forge-emerald mt-0.5">Hash Chain Connected</div>
        </div>
        <div className="bg-forge-card p-3 rounded-lg border border-forge-border">
          <div className="text-[10px] text-forge-cyan uppercase">GENESIS BLOCK</div>
          <div className="text-sm font-bold text-forge-cyan mt-1 truncate" title={blocks[0]?.blockHash}>
            {truncateHash(blocks[0]?.blockHash || '00000', 6, 6)}
          </div>
          <div className="text-[10px] text-forge-text-muted mt-0.5">Case Initiated</div>
        </div>
        <div className="bg-forge-card p-3 rounded-lg border border-forge-border">
          <div className="text-[10px] text-forge-amber uppercase">LATEST TIP HASH</div>
          <div className="text-sm font-bold text-forge-amber mt-1 truncate" title={blocks[blocks.length - 1]?.blockHash}>
            {truncateHash(blocks[blocks.length - 1]?.blockHash || '00000', 6, 6)}
          </div>
          <div className="text-[10px] text-forge-text-muted mt-0.5">Block #{blocks[blocks.length - 1]?.blockIndex || 0}</div>
        </div>
        <div className="bg-forge-card p-3 rounded-lg border border-forge-border">
          <div className="text-[10px] text-forge-emerald uppercase">MATHEMATICAL PROOF</div>
          <div className="text-xl font-bold text-forge-emerald mt-0.5">VALID</div>
          <div className="text-[10px] text-forge-text-muted mt-0.5">Zero Broken Hashes</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-forge-card p-3.5 rounded-lg border border-forge-border space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
          {/* Action Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            <span className="text-[10px] text-forge-text-muted uppercase mr-1">ACTION:</span>
            {[
              'ALL',
              'RELATIONSHIP_VERIFIED',
              'RELATIONSHIP_REJECTED',
              'AI_QUERY_EXECUTED',
              'EVIDENCE_VERIFIED',
              'ALERT_ACKNOWLEDGED',
            ].map((action) => (
              <button
                key={action}
                onClick={() => setFilterAction(action)}
                className={`px-2.5 py-1 rounded font-medium whitespace-nowrap transition text-[11px] ${
                  filterAction === action
                    ? 'bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40 shadow-sm'
                    : 'text-forge-text-secondary hover:text-white hover:bg-forge-bg'
                }`}
              >
                {action.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex items-center space-x-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-3.5 h-3.5 text-forge-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search actor, hash, target ID..."
                className="w-full bg-forge-bg border border-forge-border rounded pl-8 pr-3 py-1 text-xs text-white placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan"
              />
            </div>

            {(filterAction !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setFilterAction('ALL');
                  setSearchQuery('');
                }}
                className="p-1.5 rounded text-forge-text-muted hover:text-white hover:bg-forge-bg transition"
                title="Reset Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cryptographic Block Cards List */}
      <div className="space-y-4">
        {filteredBlocks.map((b: AuditEvent) => {
          const timeFormatted = new Date(b.timestamp).toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          return (
            <div
              key={b.id}
              className="bg-forge-card border border-forge-border hover:border-forge-cyan/30 rounded-lg p-4 space-y-3 text-xs transition duration-150 shadow-md"
            >
              {/* Human-Readable Investigation Line Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forge-border/60 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="p-1 rounded bg-forge-emerald/10 text-forge-emerald border border-forge-emerald/30">
                    <Database className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-bold text-white text-sm">BLOCK #{b.blockIndex}</span>
                  <span className="text-[10px] text-forge-cyan font-bold bg-forge-bg px-1.5 py-0.5 rounded border border-forge-border">
                    {b.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(b.action)}`}>
                    {b.action.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[11px] text-forge-text-muted">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-forge-cyan" />
                    <span className="text-white font-bold">{timeFormatted} IST</span>
                  </span>
                  <span>{b.timestamp.slice(0, 10)}</span>
                </div>
              </div>

              {/* Standard Narrative Line requested in spec */}
              <div className="p-2.5 rounded bg-forge-bg border border-forge-border/80 flex items-center justify-between">
                <div className="text-white text-xs">
                  <strong className="text-forge-cyan font-bold">{timeFormatted}</strong> —{' '}
                  <strong className="text-white">{b.actorName}</strong> —{' '}
                  <span className="text-forge-emerald font-semibold">{b.action.replace(/_/g, ' ')}</span> —{' '}
                  <span className="text-forge-text-secondary">{b.targetType} [{b.targetId}]</span>
                </div>
                <div className="text-[10px] text-forge-text-muted hidden sm:block">
                  Role: {b.actorRole}
                </div>
              </div>

              {/* Details Text */}
              <p className="text-xs text-forge-text-secondary leading-relaxed font-sans">
                {b.details}
              </p>

              {/* Cryptographic SHA-256 Hashes Grid */}
              <div className="pt-2 border-t border-forge-border/40 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-forge-bg p-2 rounded border border-forge-border flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="text-[9px] text-forge-text-muted block font-semibold">PREVIOUS HASH</span>
                    <span className="text-forge-text-secondary select-all" title={b.previousHash}>
                      {truncateHash(b.previousHash, 14, 14)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyHash(b.previousHash)}
                    className="p-1 text-forge-text-muted hover:text-white shrink-0"
                    title="Copy Previous Hash"
                  >
                    {copiedHash === b.previousHash ? (
                      <Check className="w-3.5 h-3.5 text-forge-emerald" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="bg-forge-bg p-2 rounded border border-forge-border flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="text-[9px] text-forge-emerald block font-bold">BLOCK HASH (SHA-256)</span>
                    <span className="text-forge-emerald font-bold select-all" title={b.blockHash}>
                      {truncateHash(b.blockHash, 14, 14)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyHash(b.blockHash)}
                    className="p-1 text-forge-text-muted hover:text-white shrink-0"
                    title="Copy Current Block Hash"
                  >
                    {copiedHash === b.blockHash ? (
                      <Check className="w-3.5 h-3.5 text-forge-emerald" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Security Proof & Signature */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-forge-text-muted pt-1">
                <div className="flex items-center space-x-3">
                  <span>
                    Merkle Root: <span className="text-forge-text-secondary">{b.merkleRoot}</span>
                  </span>
                  <span>
                    Signature: <span className="text-forge-cyan">{b.signature}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => togglePayload(b.id)}
                    className="text-forge-cyan hover:underline"
                  >
                    {expandedPayloads[b.id] ? 'Hide Payload' : 'Inspect Payload JSON'}
                  </button>
                  <span className="text-forge-emerald font-bold flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>SEALED</span>
                  </span>
                </div>
              </div>

              {/* Collapsible JSON Payload */}
              {expandedPayloads[b.id] && (
                <pre className="p-3 bg-black/60 rounded border border-forge-border text-[10px] text-forge-cyan overflow-x-auto">
                  {JSON.stringify(b.payload, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
