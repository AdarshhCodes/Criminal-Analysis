import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import {
  FileSearch,
  Search,
  Lock,
  ExternalLink,
  Shield,
  Video,
  PhoneCall,
  Landmark,
  FileSpreadsheet,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Share2,
  Check,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { evidenceService, investigationService } from '../services';
import { Evidence, EvidenceType, VerificationStatus } from '../types';
import { truncateHash } from '../lib/utils';

export const EvidencePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectEvidence,
    openEvidenceModal,
    verifyEvidenceAction,
    rejectEvidenceAction,
    selectEntity,
    selectedEvidence,
  } = useInvestigationStore();

  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<EvidenceType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'ALL'>('ALL');
  const [exportedToast, setExportedToast] = useState(false);

  // Retrieve raw evidence items from service
  const allEvidence = useMemo(() => {
    return evidenceService.getEvidence();
  }, [selectedEvidence]);

  // Filtered dataset before table operations
  const filteredData = useMemo(() => {
    return allEvidence.filter((item) => {
      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || item.verificationStatus === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [allEvidence, typeFilter, statusFilter]);

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<Evidence>[]>(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center space-x-1 hover:text-white font-mono"
          >
            <span>EXHIBIT ID</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="w-3 h-3 text-forge-cyan" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="w-3 h-3 text-forge-cyan" />
            ) : (
              <ArrowUpDown className="w-3 h-3 opacity-40" />
            )}
          </button>
        ),
        cell: (info) => {
          const id = info.getValue() as string;
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEvidenceModal(info.row.original);
              }}
              className="font-mono font-bold text-forge-cyan hover:underline text-left"
            >
              {id}
            </button>
          );
        },
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center space-x-1 hover:text-white font-mono"
          >
            <span>TYPE</span>
            <ArrowUpDown className="w-3 h-3 opacity-40" />
          </button>
        ),
        cell: (info) => {
          const type = info.getValue() as EvidenceType;
          return (
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-forge-bg border border-forge-border text-[11px] font-mono">
              {type === 'CCTV' && <Video className="w-3 h-3 text-indigo-400" />}
              {type === 'CDR' && <PhoneCall className="w-3 h-3 text-forge-cyan" />}
              {type === 'FINANCIAL' && <Landmark className="w-3 h-3 text-forge-emerald" />}
              {type === 'AUDIO' && <Volume2 className="w-3 h-3 text-forge-amber" />}
              {type === 'FIR' && <Shield className="w-3 h-3 text-rose-400" />}
              {type === 'DOCUMENT' && <FileSpreadsheet className="w-3 h-3 text-blue-400" />}
              <span className="font-semibold">{type}</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'title',
        header: 'ITEM & SOURCE',
        cell: (info) => {
          const item = info.row.original;
          return (
            <div className="max-w-md">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  openEvidenceModal(item);
                }}
                className="font-sans font-semibold text-white text-xs hover:text-forge-cyan cursor-pointer transition line-clamp-1"
              >
                {item.title}
              </div>
              <div className="text-forge-text-muted text-[10px] font-mono mt-0.5 line-clamp-1">
                {item.source}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'timestamp',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center space-x-1 hover:text-white font-mono"
          >
            <span>TIMESTAMP (IST)</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="w-3 h-3 text-forge-cyan" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="w-3 h-3 text-forge-cyan" />
            ) : (
              <ArrowUpDown className="w-3 h-3 opacity-40" />
            )}
          </button>
        ),
        cell: (info) => {
          const ts = info.getValue() as string;
          return (
            <div className="font-mono text-[11px] text-forge-text-secondary whitespace-nowrap">
              {new Date(ts).toLocaleString('en-IN', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </div>
          );
        },
      },
      {
        accessorKey: 'entityIds',
        header: 'RELATED ENTITIES',
        cell: (info) => {
          const ids = info.getValue() as string[];
          const entities = ids
            .map((id) => investigationService.getEntityById(id))
            .filter(Boolean);

          return (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {entities.slice(0, 3).map((ent) => (
                <button
                  key={ent!.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectEntity(ent!);
                  }}
                  className="px-1.5 py-0.5 rounded bg-forge-card hover:bg-forge-cyan/20 hover:text-forge-cyan border border-forge-border text-[10px] font-mono text-forge-text-secondary transition"
                  title={`${ent!.name} (${ent!.type})`}
                >
                  {ent!.name.length > 14 ? `${ent!.name.slice(0, 12)}...` : ent!.name}
                </button>
              ))}
              {entities.length > 3 && (
                <span className="text-[10px] font-mono text-forge-text-muted self-center">
                  +{entities.length - 3} more
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'confidence',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center space-x-1 hover:text-white font-mono"
          >
            <span>CONFIDENCE</span>
            <ArrowUpDown className="w-3 h-3 opacity-40" />
          </button>
        ),
        cell: (info) => {
          const conf = info.getValue() as number;
          return (
            <div className="flex items-center space-x-2 font-mono text-xs">
              <div className="w-12 h-1.5 rounded-full bg-forge-bg border border-forge-border overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    conf >= 95 ? 'bg-forge-emerald' : conf >= 85 ? 'bg-forge-cyan' : 'bg-forge-amber'
                  }`}
                  style={{ width: `${conf}%` }}
                />
              </div>
              <span className="font-bold text-white text-[11px]">{conf}%</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'verificationStatus',
        header: 'VERIFICATION',
        cell: (info) => {
          const status = info.getValue() as VerificationStatus;
          if (status === 'HUMAN_VERIFIED') {
            return (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-forge-emerald/15 text-forge-emerald text-[10px] font-bold border border-forge-emerald/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>VERIFIED</span>
              </span>
            );
          }
          if (status === 'REJECTED') {
            return (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 text-[10px] font-bold border border-rose-800/40">
                <XCircle className="w-3 h-3" />
                <span>REJECTED</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-forge-amber/15 text-forge-amber text-[10px] font-bold border border-forge-amber/30">
              <AlertTriangle className="w-3 h-3" />
              <span>AI SUGGESTED</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'chainOfCustody',
        header: 'CHAIN OF CUSTODY',
        cell: (info) => {
          const item = info.row.original;
          const hopsCount = item.chainOfCustody.length;
          return (
            <div className="space-y-0.5 font-mono text-[10px]">
              <div className="flex items-center space-x-1 text-forge-emerald font-semibold">
                <Lock className="w-3 h-3 shrink-0" />
                <span>{hopsCount} Sealed Hop{hopsCount > 1 ? 's' : ''}</span>
              </div>
              <div className="text-forge-text-muted" title={item.hash}>
                {truncateHash(item.hash, 5, 5)}
              </div>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right font-mono">ACTIONS</div>,
        cell: (info) => {
          const item = info.row.original;
          return (
            <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => openEvidenceModal(item)}
                className="p-1.5 rounded hover:bg-forge-bg text-forge-cyan hover:text-white transition"
                title="Inspect Exhibit Viewer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {item.verificationStatus !== 'HUMAN_VERIFIED' && (
                <button
                  onClick={() => verifyEvidenceAction(item.id)}
                  className="p-1.5 rounded hover:bg-forge-bg text-forge-emerald hover:text-emerald-300 transition"
                  title="Verify Exhibit"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}

              {item.verificationStatus !== 'REJECTED' && (
                <button
                  onClick={() => rejectEvidenceAction(item.id, 'Contested origin during evidence review')}
                  className="p-1.5 rounded hover:bg-forge-bg text-forge-text-muted hover:text-rose-400 transition"
                  title="Reject / Contest Exhibit"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => {
                  if (item.entityIds.length > 0) {
                    const ent = investigationService.getEntityById(item.entityIds[0]);
                    if (ent) selectEntity(ent);
                  }
                  navigate('/graph');
                }}
                className="p-1.5 rounded hover:bg-forge-bg text-forge-text-muted hover:text-forge-cyan transition"
                title="Link to Graph"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      },
    ],
    [openEvidenceModal, selectEntity, verifyEvidenceAction, rejectEvidenceAction, navigate]
  );

  // TanStack Table Instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleExportCustodyManifest = () => {
    const manifest = {
      operation: 'OPERATION FALCON (FIR-2026-0192)',
      exportedAt: new Date().toISOString(),
      statuteCompliance: 'Indian Evidence Act Section 65B Certified',
      totalExhibits: filteredData.length,
      exhibits: filteredData.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        sha256Seal: e.hash,
        custodySteps: e.chainOfCustody.length,
        status: e.verificationStatus,
      })),
    };

    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 2500);
  };

  const verifiedCount = allEvidence.filter((e) => e.verificationStatus === 'HUMAN_VERIFIED').length;
  const aiSuggestedCount = allEvidence.filter((e) => e.verificationStatus === 'AI_SUGGESTED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-forge-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs">
            <FileSearch className="w-4 h-4" />
            <span>CRIMINAL FORENSIC REPOSITORY // SECTION 65B VAULT</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Evidence Centre
          </h1>
          <p className="text-xs text-forge-text-muted mt-0.5">
            CCTV surveillance video, telecom CDR triangulation, lawful wiretaps, AML banking slips, and Hawala chits.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCustodyManifest}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-forge-card hover:bg-forge-cardHover border border-forge-border rounded text-xs font-mono text-forge-text-primary transition"
            title="Copy Certified Section 65B Custody Manifest to Clipboard"
          >
            {exportedToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-forge-emerald" />
                <span className="text-forge-emerald font-bold">Manifest Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Custody Manifest</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2 font-mono text-xs text-forge-emerald bg-forge-card px-3 py-1.5 rounded border border-forge-border">
            <Lock className="w-3.5 h-3.5" />
            <span>IMMUTABLE LEDGER ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-forge-card p-3 rounded-lg border border-forge-border font-mono">
          <div className="text-[10px] text-forge-text-muted uppercase">TOTAL EXHIBITS</div>
          <div className="text-xl font-bold text-white mt-0.5">{allEvidence.length}</div>
          <div className="text-[10px] text-forge-text-secondary mt-0.5">All Categories Sealed</div>
        </div>
        <div className="bg-forge-card p-3 rounded-lg border border-forge-border font-mono">
          <div className="text-[10px] text-forge-emerald uppercase">HUMAN VERIFIED</div>
          <div className="text-xl font-bold text-forge-emerald mt-0.5">{verifiedCount}</div>
          <div className="text-[10px] text-forge-text-muted mt-0.5">Court-Admissible</div>
        </div>
        <div className="bg-forge-card p-3 rounded-lg border border-forge-border font-mono">
          <div className="text-[10px] text-forge-amber uppercase">AI SUGGESTED</div>
          <div className="text-xl font-bold text-forge-amber mt-0.5">{aiSuggestedCount}</div>
          <div className="text-[10px] text-forge-text-muted mt-0.5">Awaiting Attestation</div>
        </div>
        <div className="bg-forge-card p-3 rounded-lg border border-forge-border font-mono">
          <div className="text-[10px] text-forge-cyan uppercase">STORAGE FOOTPRINT</div>
          <div className="text-xl font-bold text-forge-cyan mt-0.5">204.3 MB</div>
          <div className="text-[10px] text-forge-text-muted mt-0.5">SHA-256 Vault Intact</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-forge-card p-3.5 rounded-lg border border-forge-border space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
          {/* Type Filter Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            {(['ALL', 'CCTV', 'CDR', 'FIR', 'FINANCIAL', 'AUDIO', 'DOCUMENT'] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-2.5 py-1 rounded font-mono font-medium whitespace-nowrap transition ${
                    typeFilter === type
                      ? 'bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40 shadow-sm'
                      : 'text-forge-text-secondary hover:text-white hover:bg-forge-bg'
                  }`}
                >
                  {type}
                </button>
              )
            )}
          </div>

          {/* Search and Status Dropdown */}
          <div className="flex items-center space-x-2.5 w-full lg:w-auto">
            {/* Status Selector */}
            <div className="flex items-center space-x-1.5 font-mono text-xs">
              <Filter className="w-3.5 h-3.5 text-forge-text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-forge-bg border border-forge-border text-white text-xs rounded px-2.5 py-1 focus:outline-none focus:border-forge-cyan"
              >
                <option value="ALL">All Statuses</option>
                <option value="HUMAN_VERIFIED">Human Verified</option>
                <option value="AI_SUGGESTED">AI Suggested</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Global Search Input */}
            <div className="relative flex-1 lg:w-64">
              <Search className="w-3.5 h-3.5 text-forge-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search exhibit ID, title, source..."
                className="w-full bg-forge-bg border border-forge-border rounded pl-8 pr-3 py-1 text-xs text-white placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan"
              />
            </div>

            {(typeFilter !== 'ALL' || statusFilter !== 'ALL' || globalFilter) && (
              <button
                onClick={() => {
                  setTypeFilter('ALL');
                  setStatusFilter('ALL');
                  setGlobalFilter('');
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

      {/* Evidence Table */}
      <div className="bg-forge-card border border-forge-border rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-forge-panel border-b border-forge-border text-forge-text-muted font-mono text-[10px]"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-forge-border/40 font-mono text-[11px]">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => {
                  const isSelected = selectedEvidence?.id === row.original.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => selectEvidence(row.original)}
                      className={`hover:bg-forge-cardHover cursor-pointer transition ${
                        isSelected ? 'bg-forge-cyan/10 border-l-2 border-l-forge-cyan' : ''
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-forge-text-muted">
                      <FileSearch className="w-8 h-8 opacity-40 text-forge-cyan" />
                      <p className="text-sm font-semibold text-white">No evidence exhibits match query</p>
                      <p className="text-xs">Try adjusting your filters or search keywords.</p>
                      <button
                        onClick={() => {
                          setTypeFilter('ALL');
                          setStatusFilter('ALL');
                          setGlobalFilter('');
                        }}
                        className="mt-2 px-3 py-1 bg-forge-bg hover:bg-forge-panel border border-forge-border rounded text-xs text-forge-cyan font-mono"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-3 bg-forge-panel border-t border-forge-border flex items-center justify-between text-xs font-mono text-forge-text-muted">
          <div className="flex items-center space-x-2">
            <span>
              Showing {table.getRowModel().rows.length} of {filteredData.length} records
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded bg-forge-bg hover:bg-forge-card border border-forge-border disabled:opacity-30 disabled:pointer-events-none text-white transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white">
              Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded bg-forge-bg hover:bg-forge-card border border-forge-border disabled:opacity-30 disabled:pointer-events-none text-white transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
