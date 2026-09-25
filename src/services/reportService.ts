import { Case, Entity, Relationship, Evidence, TimelineEvent, AuditEvent } from '../types';
import { investigationService } from './investigationService';
import { evidenceService } from './evidenceService';
import { timelineService } from './timelineService';
import { auditService } from './auditService';

export interface NetworkAnalysisSummary {
  totalNodes: number;
  totalEdges: number;
  graphDensity: number;
  criticalHubNodes: { id: string; name: string; role: string; degree: number; centrality: string }[];
  syndicateClusters: { clusterName: string; memberCount: number; primaryRole: string }[];
}

export interface RiskAssessmentSummary {
  overallSyndicateRisk: number;
  threatLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED';
  primaryThreatVectors: string[];
  crossBorderExposure: string;
  assetLaunderingEstimate: string;
  recommendedActions: string[];
}

export interface EvidenceReferenceItem {
  exhibitCode: string;
  evidenceId: string;
  type: string;
  title: string;
  source: string;
  hash: string;
  custodyHops: number;
  section65BStatus: string;
}

export interface CourtReadyReportDossier {
  caseInfo: Case;
  generatedAt: string;
  preparedBy: string;
  classification: string;
  executiveSummary: string;
  keyTargets: Entity[];
  networkAnalysis: NetworkAnalysisSummary;
  timelineHighlights: TimelineEvent[];
  evidenceCitations: Evidence[];
  verifiedRelationships: (Relationship & { sourceName: string; targetName: string })[];
  unverifiedLeads: (Relationship & { sourceName: string; targetName: string })[];
  riskAssessment: RiskAssessmentSummary;
  blockchainAuditTrail: AuditEvent[];
  evidenceReferences: EvidenceReferenceItem[];
}

class ReportService {
  public generateReport(caseId: string, officerName: string): CourtReadyReportDossier {
    const targetCase = investigationService.getCaseById(caseId) || investigationService.getCases()[0];
    const entities = investigationService.getEntities(targetCase.id);
    const relationships = investigationService.getRelationships(targetCase.id);
    const evidenceList = evidenceService.getEvidence();
    const timeline = timelineService.getTimeline({ order: 'asc' });
    const auditBlocks = auditService.getBlocks();

    const entityMap = new Map<string, string>();
    entities.forEach((e) => entityMap.set(e.id, e.name));

    const keyTargets = entities
      .filter((e) => e.riskScore >= 75)
      .sort((a, b) => b.riskScore - a.riskScore);

    // Degree calculation for network analysis
    const degrees = new Map<string, number>();
    relationships.forEach((r) => {
      degrees.set(r.sourceId, (degrees.get(r.sourceId) || 0) + 1);
      degrees.set(r.targetId, (degrees.get(r.targetId) || 0) + 1);
    });

    const criticalHubNodes = entities
      .map((e) => ({
        id: e.id,
        name: e.name,
        role: e.role || e.type,
        degree: degrees.get(e.id) || 0,
        centrality: (degrees.get(e.id) || 0) > 4 ? 'CRITICAL BOTTLENECK' : (degrees.get(e.id) || 0) > 2 ? 'HIGH DEGREE' : 'INTERMEDIARY',
      }))
      .filter((h) => h.degree > 1)
      .sort((a, b) => b.degree - a.degree)
      .slice(0, 5);

    const verifiedRels = relationships
      .filter((r) => r.verificationStatus === 'HUMAN_VERIFIED')
      .map((r) => ({
        ...r,
        sourceName: entityMap.get(r.sourceId) || r.sourceId,
        targetName: entityMap.get(r.targetId) || r.targetId,
      }));

    const unverifiedRels = relationships
      .filter((r) => r.verificationStatus === 'AI_SUGGESTED')
      .map((r) => ({
        ...r,
        sourceName: entityMap.get(r.sourceId) || r.sourceId,
        targetName: entityMap.get(r.targetId) || r.targetId,
      }));

    const networkAnalysis: NetworkAnalysisSummary = {
      totalNodes: entities.length,
      totalEdges: relationships.length,
      graphDensity: Math.round((2 * relationships.length / (entities.length * (entities.length - 1))) * 1000) / 1000 || 0.042,
      criticalHubNodes,
      syndicateClusters: [
        { clusterName: 'Executive / Controller Cell', memberCount: 3, primaryRole: 'Rajesh Kumar & Amit Sharma Hawala Command' },
        { clusterName: 'Logistics & Distribution Cell', memberCount: 4, primaryRole: 'Okhla Warehouse & Courier Transport Network' },
        { clusterName: 'Telephony & Burner Cell', memberCount: 4, primaryRole: 'Pooja Verma Fake e-KYC SIM Reseller Ring' },
        { clusterName: 'Offshore Remittance Cell', memberCount: 3, primaryRole: 'Deira Gold Souk & Singapore Shell Inward remittance' },
      ],
    };

    const riskAssessment: RiskAssessmentSummary = {
      overallSyndicateRisk: 91,
      threatLevel: 'CRITICAL',
      primaryThreatVectors: [
        'High-velocity physical cash smuggling via burner couriers',
        'Bulk forged e-KYC burner SIM provisioning to evade lawful surveillance',
        'Cross-border shell structuring through UAE/Hong Kong Hawala channels',
        'Layered domestic deposits in bullion accounts below ₹2 Lakh reporting threshold',
      ],
      crossBorderExposure: 'High (Direct settlements with UAE Al-Noor Currency Services, estimated ₹14.2 Crore)',
      assetLaunderingEstimate: '₹48.5 Crore total lifetime flow (₹14.2 Crore intercepted under current FIR)',
      recommendedActions: [
        'Immediate freezing orders under Section 102 CrPC on Federal Merchant Bank accounts #991024 & #440182',
        'Issuance of Red Corner / Lookout Circular (LOC) against Mohd. Tariq (UAE node)',
        'Physical cordoning of Okhla Warehouse #14 and forensic seizure of DVR hard drives',
        'Section 65B certificate deposition before the Learned Special Judge, Patiala House Courts',
      ],
    };

    const evidenceReferences: EvidenceReferenceItem[] = evidenceList.map((ev, index) => ({
      exhibitCode: `EX-${String(index + 1).padStart(2, '0')}`,
      evidenceId: ev.id,
      type: ev.type,
      title: ev.title,
      source: ev.source,
      hash: ev.hash,
      custodyHops: ev.chainOfCustody?.length || 1,
      section65BStatus: ev.verificationStatus === 'HUMAN_VERIFIED' ? 'CERTIFIED & SEALED' : 'PENDING NOTARIZATION',
    }));

    return {
      caseInfo: targetCase,
      generatedAt: new Date().toISOString(),
      preparedBy: officerName,
      classification: 'CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE // TRIAL READY',
      executiveSummary:
        `Comprehensive intelligence brief submitted under Section 65B of the Indian Evidence Act. Investigation into ${targetCase.name} has mapped a multi-tier organized syndicate operating across Delhi NCR, Dubai, and Hong Kong jurisdictions. Network analysis has established direct physical, telephonic, and financial links between primary kingpin Rajesh Kumar (IF-P-001) and Hawala broker Amit Sharma (IF-P-007) via intermediary burner telephony. Foreign inward remittances totaling ₹14.2 Crore were layered through corporate shell entities and liquidated into bullion. All digital exhibits have been preserved with cryptographic SHA-256 integrity hashes on a tamper-evident audit ledger.`,
      keyTargets,
      networkAnalysis,
      timelineHighlights: timeline.slice(0, 8),
      evidenceCitations: evidenceList,
      verifiedRelationships: verifiedRels,
      unverifiedLeads: unverifiedRels,
      riskAssessment,
      blockchainAuditTrail: auditBlocks,
      evidenceReferences,
    };
  }
}

export const reportService = new ReportService();
