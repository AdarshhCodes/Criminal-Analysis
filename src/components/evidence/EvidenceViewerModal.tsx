import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Shield,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Share2,
  Copy,
  Check,
  Video,
  PhoneCall,
  Landmark,
  FileSpreadsheet,
  Volume2,
  Play,
  Pause,
  ExternalLink,
  Cpu,
  Fingerprint,
} from 'lucide-react';
import { useInvestigationStore } from '../../stores';
import { investigationService } from '../../services';
import { Entity } from '../../types';

export const EvidenceViewerModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isEvidenceModalOpen,
    viewingEvidence,
    closeEvidenceModal,
    verifyEvidenceAction,
    flagEvidenceAction,
    selectEntity,
  } = useInvestigationStore();

  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isVerifyingSeal, setIsVerifyingSeal] = useState(false);
  const [sealVerified, setSealVerified] = useState(true);
  const [showFlagInput, setShowFlagInput] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [activeTab, setActiveTab] = useState<'FORENSIC_PREVIEW' | 'CHAIN_OF_CUSTODY'>('FORENSIC_PREVIEW');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEvidenceModalOpen) {
        closeEvidenceModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEvidenceModalOpen, closeEvidenceModal]);

  if (!isEvidenceModalOpen || !viewingEvidence) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(viewingEvidence.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyCitation = () => {
    const citation = `[FORENSIC CITATION — SEC 65B INDIAN EVIDENCE ACT]
EXHIBIT ID: ${viewingEvidence.id}
TYPE: ${viewingEvidence.type}
TITLE: ${viewingEvidence.title}
SOURCE: ${viewingEvidence.source}
TIMESTAMP: ${viewingEvidence.timestamp}
SHA-256 DIGITAL SEAL: ${viewingEvidence.hash}
CHAIN OF CUSTODY STEPS: ${viewingEvidence.chainOfCustody.length} verified transitions
ATTESTED BY: Central Cyber Forensic Laboratory & Special Cell`;

    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  const handleVerifySeal = () => {
    setIsVerifyingSeal(true);
    setTimeout(() => {
      setIsVerifyingSeal(false);
      setSealVerified(true);
    }, 600);
  };

  const handleVerifyExhibit = async () => {
    await verifyEvidenceAction(viewingEvidence.id);
  };

  const handleFlagSubmit = async () => {
    if (!flagReason.trim()) return;
    await flagEvidenceAction(viewingEvidence.id, flagReason);
    setShowFlagInput(false);
    setFlagReason('');
  };

  const handleLinkToGraph = () => {
    if (viewingEvidence.entityIds.length > 0) {
      const firstEntity = investigationService.getEntityById(viewingEvidence.entityIds[0]);
      if (firstEntity) {
        selectEntity(firstEntity);
      }
    }
    closeEvidenceModal();
    navigate('/graph');
  };

  const relatedEntities: Entity[] = viewingEvidence.entityIds
    .map((id) => investigationService.getEntityById(id))
    .filter((e): e is Entity => Boolean(e));

  const isVerified = viewingEvidence.verificationStatus === 'HUMAN_VERIFIED';
  const isFlagged = Boolean(viewingEvidence.metadata?.flagged);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-forge-panel border border-forge-cyan/40 rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-forge-text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tactical Header */}
        <div className="px-5 py-3.5 bg-forge-bg border-b border-forge-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
              {viewingEvidence.type === 'CCTV' && <Video className="w-5 h-5" />}
              {viewingEvidence.type === 'CDR' && <PhoneCall className="w-5 h-5" />}
              {viewingEvidence.type === 'FINANCIAL' && <Landmark className="w-5 h-5" />}
              {viewingEvidence.type === 'AUDIO' && <Volume2 className="w-5 h-5" />}
              {viewingEvidence.type === 'FIR' && <Shield className="w-5 h-5" />}
              {viewingEvidence.type === 'DOCUMENT' && <FileSpreadsheet className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-forge-cyan tracking-wider">
                  {viewingEvidence.id}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forge-card border border-forge-border text-forge-text-muted">
                  {viewingEvidence.type}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40 font-semibold tracking-wider uppercase">
                  TOP SECRET // SECTION 65B READY
                </span>
                {isFlagged && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-700/40 font-semibold">
                    FLAGGED ANOMALY
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white mt-0.5 line-clamp-1">
                {viewingEvidence.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1 font-mono text-[11px] bg-forge-card px-2.5 py-1 rounded border border-forge-border">
              <span className="text-forge-text-muted">CONFIDENCE:</span>
              <span className="text-forge-emerald font-bold">{viewingEvidence.confidence}%</span>
            </div>
            <button
              onClick={closeEvidenceModal}
              className="p-1.5 rounded-lg text-forge-text-muted hover:text-white hover:bg-forge-card transition"
              title="Close Viewer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-5 py-2 bg-forge-card/60 border-b border-forge-border text-xs">
          <button
            onClick={() => setActiveTab('FORENSIC_PREVIEW')}
            className={`px-3 py-1.5 rounded font-mono font-medium transition flex items-center space-x-1.5 ${
              activeTab === 'FORENSIC_PREVIEW'
                ? 'bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40 shadow-sm'
                : 'text-forge-text-secondary hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>FORENSIC VISUALIZER</span>
          </button>
          <button
            onClick={() => setActiveTab('CHAIN_OF_CUSTODY')}
            className={`px-3 py-1.5 rounded font-mono font-medium transition flex items-center space-x-1.5 ${
              activeTab === 'CHAIN_OF_CUSTODY'
                ? 'bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40 shadow-sm'
                : 'text-forge-text-secondary hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>CHAIN OF CUSTODY ({viewingEvidence.chainOfCustody.length} HOPS)</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'FORENSIC_PREVIEW' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Forensic Display Canvas */}
              <div className="lg:col-span-7 space-y-4">
                {/* Visualizer Frame */}
                {viewingEvidence.type === 'CCTV' && (
                  <div className="relative bg-black rounded-lg border border-forge-border overflow-hidden aspect-video flex flex-col justify-between p-3 font-mono text-[11px] shadow-inner group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.04),transparent_70%)] pointer-events-none" />
                    
                    {/* CCTV Overlay Top */}
                    <div className="flex items-center justify-between text-rose-500 font-bold z-10">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                        <span>● REC [CAM-04 OKHLA GATE]</span>
                      </div>
                      <span className="text-white/80">{viewingEvidence.timestamp.replace('T', ' ').replace('Z', ' IST')}</span>
                    </div>

                    {/* Simulated Camera Center Graphics & Bounding Boxes */}
                    <div className="relative flex-1 flex items-center justify-center my-2">
                      <div className="absolute border border-white/20 w-16 h-16 pointer-events-none" />
                      <div className="absolute border-t border-b border-white/10 w-full h-[1px] pointer-events-none" />
                      <div className="absolute border-l border-r border-white/10 h-full w-[1px] pointer-events-none" />

                      {/* Bounding Box 1: Suspect */}
                      <div className="absolute left-[28%] top-[20%] w-[32%] h-[60%] border-2 border-forge-amber/90 bg-forge-amber/10 rounded flex flex-col justify-between p-1.5 backdrop-blur-[1px]">
                        <div className="bg-forge-amber text-black font-mono font-bold text-[9px] px-1 py-0.5 rounded-sm inline-flex items-center space-x-1 self-start">
                          <span>PERSON: SURESH RAINA (94.2% MATCH)</span>
                        </div>
                        <div className="text-[9px] font-mono text-forge-amber self-end bg-black/60 px-1 rounded">
                          [BBOX: 320, 110, 480, 520]
                        </div>
                      </div>

                      {/* Bounding Box 2: Vehicle */}
                      <div className="absolute right-[12%] bottom-[12%] w-[26%] h-[38%] border-2 border-forge-cyan/90 bg-forge-cyan/10 rounded flex flex-col justify-between p-1.5 backdrop-blur-[1px]">
                        <div className="bg-forge-cyan text-black font-mono font-bold text-[9px] px-1 py-0.5 rounded-sm inline-flex items-center space-x-1 self-start">
                          <span>OCR: DL-08-C-9921 (98.2%)</span>
                        </div>
                        <div className="text-[9px] font-mono text-forge-cyan self-end bg-black/60 px-1 rounded">
                          [VEHICLE: SCORPIO S11]
                        </div>
                      </div>
                    </div>

                    {/* CCTV Overlay Bottom */}
                    <div className="flex items-center justify-between text-forge-text-muted z-10 border-t border-white/10 pt-2 text-[10px]">
                      <span>FPS: 30.00 | SENSOR: SONY STARVIS 4K</span>
                      <span className="text-forge-cyan font-bold">LAT: 28.5355° N, LON: 77.2650° E</span>
                    </div>
                  </div>
                )}

                {viewingEvidence.type === 'CDR' && (
                  <div className="bg-forge-card border border-forge-border rounded-lg p-4 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-forge-cyan pb-2 border-b border-forge-border">
                      <span className="font-bold flex items-center space-x-1.5">
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>TELECOMMUNICATION CDR LOG DUMP</span>
                      </span>
                      <span className="text-[10px] text-forge-text-muted">CARRIER INTERCEPT SFTP</span>
                    </div>

                    <div className="bg-forge-bg rounded p-3 border border-forge-border space-y-2 text-[11px] overflow-x-auto">
                      <div className="grid grid-cols-5 gap-2 text-forge-text-muted border-b border-forge-border/60 pb-1 font-semibold">
                        <div>DIRECTION</div>
                        <div>CALLER (A-PARTY)</div>
                        <div>CALLEE (B-PARTY)</div>
                        <div>DURATION</div>
                        <div>TOWER SECTOR</div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 py-1 text-white hover:bg-forge-card transition rounded px-1">
                        <span className="text-forge-rose font-bold">OUTBOUND</span>
                        <span className="text-forge-cyan">+91 98110 44019</span>
                        <span className="text-forge-amber">+91 91200 44819</span>
                        <span>32s</span>
                        <span className="text-forge-emerald">DEL-VV-401 (Vasant Vihar)</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 py-1 text-white hover:bg-forge-card transition rounded px-1">
                        <span className="text-forge-rose font-bold">RELAY HOP</span>
                        <span className="text-forge-amber">+91 91200 44819</span>
                        <span className="text-forge-rose">+91 98712 33810</span>
                        <span>180s</span>
                        <span className="text-forge-emerald">DEL-KB-112 (Karol Bagh)</span>
                      </div>
                    </div>

                    <p className="text-xs text-forge-text-secondary leading-relaxed font-sans">
                      Triangulation indicates intermediate burner SIM was physically active within 800m of South Extension while communicating with Rajesh Kumar and Amit Sharma consecutively.
                    </p>
                  </div>
                )}

                {viewingEvidence.type === 'AUDIO' && (
                  <div className="bg-forge-card border border-forge-border rounded-lg p-4 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-forge-cyan pb-2 border-b border-forge-border">
                      <span className="font-bold flex items-center space-x-1.5">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>CMS LAWFUL WIRETAP AUDIO STREAM</span>
                      </span>
                      <span className="text-[10px] text-forge-emerald">22.0 MB FLAC // 48kHz</span>
                    </div>

                    {/* Simulated Waveform Canvas */}
                    <div className="bg-forge-bg rounded p-3 border border-forge-border flex items-center space-x-3">
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="p-2.5 rounded-full bg-forge-cyan text-black hover:bg-forge-cyanLight transition shrink-0"
                      >
                        {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
                      </button>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-forge-text-muted">
                          <span>{isPlayingAudio ? '00:42' : '00:00'}</span>
                          <span className="text-forge-cyan">VOICE BIOMETRIC CONFIRMED: 93.8%</span>
                          <span>03:15</span>
                        </div>
                        {/* Audio Waveform Bars */}
                        <div className="h-8 flex items-center space-x-1">
                          {Array.from({ length: 36 }).map((_, i) => {
                            const heights = [30, 45, 75, 90, 60, 40, 85, 95, 70, 50, 65, 80, 40, 90, 100, 60, 45, 80];
                            const heightPct = heights[i % heights.length];
                            return (
                              <div
                                key={i}
                                className={`flex-1 rounded-full transition-all duration-200 ${
                                  isPlayingAudio && i < 18
                                    ? 'bg-forge-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                                    : 'bg-forge-borderLight'
                                }`}
                                style={{ height: `${heightPct}%` }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Transcription Transcript */}
                    <div className="p-3 bg-forge-bg border border-forge-border rounded text-[11px] font-sans space-y-2">
                      <div className="text-[10px] font-mono text-forge-text-muted uppercase">
                        AI Whisper Large-v3 Forensic Audio Transcript:
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-forge-cyan">
                          <strong className="font-mono text-xs">[00:12 - Speaker 1 (Rajesh Kumar)]:</strong> &ldquo;Did the token from Munshi reach the Deira office?&rdquo;
                        </p>
                        <p className="text-forge-amber">
                          <strong className="font-mono text-xs">[00:24 - Speaker 2 (Mohd. Tariq)]:</strong> &ldquo;Yes, 500 was settled this afternoon. Make sure Vicky moves the cartons before Monday.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {viewingEvidence.type === 'FINANCIAL' && (
                  <div className="bg-forge-card border border-forge-border rounded-lg p-4 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-forge-cyan pb-2 border-b border-forge-border">
                      <span className="font-bold flex items-center space-x-1.5">
                        <Landmark className="w-3.5 h-3.5" />
                        <span>FIU-IND SUSPICIOUS TRANSACTION REPORT (STR)</span>
                      </span>
                      <span className="text-[10px] text-forge-amber font-bold">RED FLAG: STRUCTURING</span>
                    </div>

                    <div className="bg-forge-bg p-3.5 rounded border border-forge-border space-y-3">
                      <div className="flex items-center justify-between text-white border-b border-forge-border pb-2">
                        <div>
                          <div className="text-[10px] text-forge-text-muted">REMITTANCE SUM</div>
                          <div className="text-xl font-bold text-forge-emerald">₹1,85,00,000.00</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-forge-text-muted">PAYMENT CHANNEL</div>
                          <div className="text-xs font-bold text-forge-cyan">RTGS / UTR #00991823</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div className="p-2 rounded bg-forge-card border border-forge-border">
                          <div className="text-forge-text-muted text-[10px]">ORIGIN ACCOUNT</div>
                          <div className="font-bold text-white">Surya Bullion Traders</div>
                          <div className="text-forge-text-muted">A/C: 044018299102 (HDFC Bank)</div>
                        </div>
                        <div className="p-2 rounded bg-forge-card border border-forge-border">
                          <div className="text-forge-text-muted text-[10px]">BENEFICIARY ACCOUNT</div>
                          <div className="font-bold text-white">Apex Global Trading</div>
                          <div className="text-forge-text-muted">A/C: 0099102488190 (ICICI Bank)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {viewingEvidence.type === 'FIR' && (
                  <div className="bg-forge-card border border-forge-border rounded-lg p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-forge-cyan pb-2 border-b border-forge-border font-mono">
                      <span className="font-bold flex items-center space-x-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span>FIRST INFORMATION REPORT (CCTNS DELPHI POLICE)</span>
                      </span>
                      <span className="text-[10px] text-forge-emerald font-bold">STATE SEAL ATTESTED</span>
                    </div>

                    <div className="p-4 bg-forge-bg rounded border border-forge-border space-y-3 font-mono text-[11px]">
                      <div className="flex items-center justify-between border-b border-forge-border pb-2">
                        <span className="text-white font-bold">FIR NO: 2026-0192</span>
                        <span className="text-forge-text-muted">POLICE STATION: SPECIAL CELL, LODHI COLONY</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-forge-text-muted">ACT & SECTIONS: </span>
                          <span className="text-rose-400 font-bold">IPC 420, 120B, IT ACT 66D, PMLA 2002</span>
                        </div>
                        <div>
                          <span className="text-forge-text-muted">COMPLAINANT: </span>
                          <span className="text-white font-bold">Directorate of Revenue Intelligence</span>
                        </div>
                      </div>

                      <div className="p-2 bg-forge-card rounded text-forge-text-secondary text-xs leading-relaxed font-sans">
                        &ldquo;...Primary named accused Rajesh Kumar in active criminal conspiracy with Amit Sharma operated fictitious trade entities to illicitly channel hawala money overseas via token contracts...&rdquo;
                      </div>
                    </div>
                  </div>
                )}

                {viewingEvidence.type === 'DOCUMENT' && (
                  <div className="bg-forge-card border border-forge-border rounded-lg p-4 space-y-3 text-xs font-mono">
                    <div className="flex items-center justify-between text-forge-cyan pb-2 border-b border-forge-border">
                      <span className="font-bold flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>PHYSICAL SEIZURE MEMORANDUM & CHIT SCAN</span>
                      </span>
                      <span className="text-[10px] text-forge-amber">RECOVERED FROM KAROL BAGH</span>
                    </div>

                    <div className="p-4 bg-forge-bg rounded border border-forge-border space-y-2 text-[11px]">
                      <div className="text-[10px] text-forge-text-muted uppercase">
                        Forensic OCR Extraction (Seized Slip CH-992):
                      </div>
                      <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded text-amber-200 font-mono text-xs leading-relaxed">
                        07-09-26 // Munshi -&gt; Tariq Bhai Deira // 500,000 AED // Token Ref: 4491-DX // Deliver to Courier Suresh at Okhla // Code word: FALCON-7
                      </div>
                      <div className="text-[10px] text-forge-text-muted pt-1">
                        Forensic Note: Ink chromatography confirms handwriting matched suspect Amit Sharma ledger records.
                      </div>
                    </div>
                  </div>
                )}

                {/* Evidence Narrative Description */}
                <div className="p-3 bg-forge-bg border border-forge-border rounded-lg space-y-1">
                  <div className="text-[10px] font-mono text-forge-text-muted uppercase font-semibold">
                    Investigative Summary & Provenance
                  </div>
                  <p className="text-xs text-forge-text-secondary leading-relaxed font-sans">
                    {viewingEvidence.description}
                  </p>
                </div>
              </div>

              {/* Right Column: Integrity Ledger & Related Entities */}
              <div className="lg:col-span-5 space-y-4">
                {/* Cryptographic Seal Card */}
                <div className="bg-forge-card border border-forge-border rounded-lg p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-forge-emerald">
                      <Lock className="w-3.5 h-3.5" />
                      <span>CRYPTOGRAPHIC INTEGRITY SEAL</span>
                    </div>
                    {isVerified ? (
                      <span className="px-2 py-0.5 rounded bg-forge-emerald/20 text-forge-emerald font-mono text-[10px] font-bold">
                        VERIFIED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-forge-amber/20 text-forge-amber font-mono text-[10px] font-bold">
                        AI SUGGESTED
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 bg-forge-bg p-2.5 rounded border border-forge-border">
                    <div className="flex items-center justify-between text-[10px] font-mono text-forge-text-muted">
                      <span>SHA-256 HASH</span>
                      <button
                        onClick={handleCopyHash}
                        className="text-forge-cyan hover:underline flex items-center space-x-1"
                      >
                        {copiedHash ? (
                          <>
                            <Check className="w-3 h-3 text-forge-emerald" />
                            <span className="text-forge-emerald">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-[11px] text-forge-emerald break-all select-all font-semibold">
                      {viewingEvidence.hash}
                    </div>
                  </div>

                  <button
                    onClick={handleVerifySeal}
                    disabled={isVerifyingSeal}
                    className="w-full py-1.5 px-3 rounded bg-forge-bg hover:bg-forge-cardHover border border-forge-border font-mono text-xs text-forge-cyan flex items-center justify-center space-x-2 transition disabled:opacity-50"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>
                      {isVerifyingSeal
                        ? 'Validating Block Signature...'
                        : sealVerified
                        ? 'Cryptographic Seal Verified (SHA-256 Valid)'
                        : 'Verify Cryptographic Seal'}
                    </span>
                  </button>
                </div>

                {/* Related Entities Card */}
                <div className="bg-forge-card border border-forge-border rounded-lg p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">
                      LINKED ENTITIES ({relatedEntities.length})
                    </span>
                    <span className="text-[10px] font-mono text-forge-text-muted">DIRECT ADMISSIBILITY</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {relatedEntities.map((entity) => (
                      <div
                        key={entity.id}
                        onClick={() => {
                          selectEntity(entity);
                          closeEvidenceModal();
                          navigate('/graph');
                        }}
                        className="p-2 rounded bg-forge-bg hover:bg-forge-cardHover border border-forge-border flex items-center justify-between cursor-pointer group transition"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-forge-cyan transition">
                            {entity.name}
                          </div>
                          <div className="font-mono text-[10px] text-forge-text-muted">
                            {entity.id} • {entity.type}
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-forge-text-muted group-hover:text-forge-cyan transition" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Metadata Overview */}
                <div className="bg-forge-card border border-forge-border rounded-lg p-3.5 space-y-2 text-xs font-mono">
                  <div className="text-[10px] text-forge-text-muted font-bold">SOURCE TELEMETRY</div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-forge-text-muted">Source:</span>
                      <span className="text-white">{viewingEvidence.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forge-text-muted">Timestamp:</span>
                      <span className="text-white">{viewingEvidence.timestamp.slice(0, 19).replace('T', ' ')}</span>
                    </div>
                    {viewingEvidence.fileSize && (
                      <div className="flex justify-between">
                        <span className="text-forge-text-muted">File Size:</span>
                        <span className="text-white">{viewingEvidence.fileSize}</span>
                      </div>
                    )}
                    {viewingEvidence.mimeType && (
                      <div className="flex justify-between">
                        <span className="text-forge-text-muted">MIME Format:</span>
                        <span className="text-forge-cyan">{viewingEvidence.mimeType}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Flag Form if active */}
                {showFlagInput && (
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-600/40 space-y-2 text-xs">
                    <div className="font-mono text-rose-400 font-bold flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>FLAG FORENSIC DISCREPANCY</span>
                    </div>
                    <textarea
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      placeholder="Specify reason for discrepancy or custodial contest..."
                      rows={2}
                      className="w-full bg-forge-bg border border-forge-border rounded p-2 text-white text-xs placeholder:text-forge-text-muted focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowFlagInput(false)}
                        className="px-2 py-1 text-forge-text-muted hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleFlagSubmit}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-mono font-bold"
                      >
                        Submit Flag
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Chain of Custody Detail Tab */
            <div className="space-y-4">
              <div className="p-4 bg-forge-card border border-forge-border rounded-lg space-y-3">
                <div className="flex items-center justify-between border-b border-forge-border pb-2">
                  <div className="font-mono text-xs font-bold text-forge-cyan flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>IMMUTABLE EVIDENCE CHAIN OF CUSTODY LEDGER</span>
                  </div>
                  <span className="font-mono text-[10px] text-forge-emerald">
                    {viewingEvidence.chainOfCustody.length} CRYPTOGRAPHIC HOPS RECORDED
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {viewingEvidence.chainOfCustody.map((record, index) => (
                    <div
                      key={index}
                      className="p-3 bg-forge-bg rounded border border-forge-border font-mono text-xs space-y-1.5 hover:border-forge-cyan/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-forge-cyan/20 text-forge-cyan font-bold text-[10px]">
                          STEP #{record.step}: {record.action}
                        </span>
                        <span className="text-forge-text-muted text-[10px]">
                          {new Date(record.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-forge-text-secondary text-[11px] pt-1">
                        <div>
                          <strong>Officer:</strong> {record.officer} (Badge: {record.badgeNumber})
                        </div>
                        <div>
                          <strong>Agency:</strong> {record.agency}
                        </div>
                      </div>

                      <div className="text-[10px] text-forge-text-muted flex items-center space-x-2 pt-1 border-t border-forge-border/40">
                        <span>DIGITAL SIGNATURE:</span>
                        <span className="text-forge-emerald">{record.hashSignature}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-5 py-3.5 bg-forge-bg border-t border-forge-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCitation}
              className="px-3 py-1.5 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border font-mono text-xs text-forge-text-primary flex items-center space-x-1.5 transition"
              title="Export Section 65B Indian Evidence Act Citation"
            >
              {copiedCitation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-forge-emerald" />
                  <span className="text-forge-emerald">Citation Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Export Citation</span>
                </>
              )}
            </button>

            <button
              onClick={handleLinkToGraph}
              className="px-3 py-1.5 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border font-mono text-xs text-forge-cyan flex items-center space-x-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Link To Graph</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {!showFlagInput && (
              <button
                onClick={() => setShowFlagInput(true)}
                className="px-3 py-1.5 rounded bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800/50 font-mono text-xs text-rose-400 flex items-center space-x-1.5 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Flag Discrepancy</span>
              </button>
            )}

            {!isVerified ? (
              <button
                onClick={handleVerifyExhibit}
                className="px-4 py-1.5 rounded bg-forge-emerald hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>VERIFY EXHIBIT</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-forge-emerald/15 border border-forge-emerald/40 text-forge-emerald font-mono text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>VERIFIED EXHIBIT</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
