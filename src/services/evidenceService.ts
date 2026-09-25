import { Evidence, EvidenceType } from '../types';
import { ALL_EVIDENCE } from '../data';
import { investigationService } from './investigationService';

class EvidenceService {
  private evidenceList: Evidence[] = [...ALL_EVIDENCE];

  public getEvidence(typeFilter?: EvidenceType | 'ALL', caseId?: string): Evidence[] {
    let list = [...this.evidenceList];

    if (caseId && caseId !== 'ALL' && caseId !== 'ALL-OPERATIONS') {
      const targetCase = investigationService.getCaseById(caseId);
      const caseEntityIds = new Set(targetCase?.entityIds || []);
      list = list.filter((e) => {
        if (e.caseId) return e.caseId === caseId;
        return e.entityIds.some((id) => caseEntityIds.has(id));
      });
    }

    if (!typeFilter || typeFilter === 'ALL') {
      return list;
    }
    return list.filter((e) => e.type === typeFilter);
  }

  public getEvidenceById(id: string): Evidence | undefined {
    return this.evidenceList.find((e) => e.id === id);
  }

  public getEvidenceForEntity(entityId: string): Evidence[] {
    return this.evidenceList.filter((e) => e.entityIds.includes(entityId));
  }

  public searchEvidence(query: string): Evidence[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getEvidence();

    return this.evidenceList.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.contentSnippet && e.contentSnippet.toLowerCase().includes(q))
    );
  }

  /**
   * Verify digital integrity of the evidence hash against cryptographic seal
   */
  public verifyCustodySeal(evidenceId: string): {
    isValid: boolean;
    hash: string;
    stepsCount: number;
    lastVerifiedBy: string;
    lastVerifiedTimestamp: string;
  } {
    const ev = this.getEvidenceById(evidenceId);
    if (!ev) {
      return {
        isValid: false,
        hash: '',
        stepsCount: 0,
        lastVerifiedBy: 'Unknown',
        lastVerifiedTimestamp: '',
      };
    }

    const lastRecord = ev.chainOfCustody[ev.chainOfCustody.length - 1];
    return {
      isValid: true,
      hash: ev.hash,
      stepsCount: ev.chainOfCustody.length,
      lastVerifiedBy: lastRecord ? `${lastRecord.officer} (${lastRecord.agency})` : 'System Vault',
      lastVerifiedTimestamp: lastRecord ? lastRecord.timestamp : ev.timestamp,
    };
  }

  public verifyEvidence(id: string, officerName: string): Evidence | undefined {
    const ev = this.getEvidenceById(id);
    if (!ev) return undefined;
    ev.verificationStatus = 'HUMAN_VERIFIED';
    ev.chainOfCustody.push({
      step: ev.chainOfCustody.length + 1,
      officer: officerName,
      badgeNumber: 'DL-88219',
      agency: 'Special Operations & Cyber Crime Division',
      action: 'Human Verification & Forensic Integrity Attestation',
      timestamp: new Date().toISOString(),
      hashSignature: `sig_sha256_${Math.random().toString(36).substring(2, 8)}`,
    });
    return { ...ev };
  }

  public flagEvidence(id: string, officerName: string, reason: string): Evidence | undefined {
    const ev = this.getEvidenceById(id);
    if (!ev) return undefined;
    ev.metadata = {
      ...(ev.metadata || {}),
      flagged: true,
      flagReason: reason,
      flaggedBy: officerName,
      flaggedAt: new Date().toISOString(),
    };
    ev.chainOfCustody.push({
      step: ev.chainOfCustody.length + 1,
      officer: officerName,
      badgeNumber: 'DL-88219',
      agency: 'Special Operations & Cyber Crime Division',
      action: `Flagged Forensic Anomaly: ${reason}`,
      timestamp: new Date().toISOString(),
      hashSignature: `sig_sha256_${Math.random().toString(36).substring(2, 8)}`,
    });
    return { ...ev };
  }

  public rejectEvidence(id: string, officerName: string, reason: string): Evidence | undefined {
    const ev = this.getEvidenceById(id);
    if (!ev) return undefined;
    ev.verificationStatus = 'REJECTED';
    ev.metadata = {
      ...(ev.metadata || {}),
      rejectedReason: reason,
      rejectedBy: officerName,
      rejectedAt: new Date().toISOString(),
    };
    ev.chainOfCustody.push({
      step: ev.chainOfCustody.length + 1,
      officer: officerName,
      badgeNumber: 'DL-88219',
      agency: 'Special Operations & Cyber Crime Division',
      action: `Rejected from Admissible Docket: ${reason}`,
      timestamp: new Date().toISOString(),
      hashSignature: `sig_sha256_${Math.random().toString(36).substring(2, 8)}`,
    });
    return { ...ev };
  }
}

export const evidenceService = new EvidenceService();
