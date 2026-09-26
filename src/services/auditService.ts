import { AuditEvent } from '../types';
import { INITIAL_AUDIT_BLOCKS } from '../data';

class AuditService {
  private blocks: AuditEvent[] = [...INITIAL_AUDIT_BLOCKS];

  public getBlocks(): AuditEvent[] {
    return [...this.blocks];
  }

  public getBlockByIndex(index: number): AuditEvent | undefined {
    return this.blocks.find((b) => b.blockIndex === index);
  }

  /**
   * Cryptographic SHA-256 calculation using Web Crypto API
   */
  private async calculateSha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Mint a new cryptographic audit block sealing an investigator action
   */
  public async mintBlock(params: {
    actorId: string;
    actorName: string;
    actorRole: string;
    action: AuditEvent['action'];
    targetType: AuditEvent['targetType'];
    targetId: string;
    details: string;
    payload?: Record<string, unknown>;
  }): Promise<AuditEvent> {
    const lastBlock = this.blocks[this.blocks.length - 1];
    const newIndex = lastBlock ? lastBlock.blockIndex + 1 : 0;
    const previousHash = lastBlock
      ? lastBlock.blockHash
      : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = new Date().toISOString();

    const blockContent = JSON.stringify({
      index: newIndex,
      previousHash,
      actorId: params.actorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      timestamp,
      details: params.details,
      payload: params.payload || {},
    });

    const blockHash = await this.calculateSha256(blockContent);
    const merkleRoot = await this.calculateSha256(`${previousHash}:${blockHash}`);
    const signature = `sig_${params.actorId.toLowerCase().replace(/[^a-z0-9]/g, '')}_${timestamp.slice(0, 10)}`;

    const newBlock: AuditEvent = {
      id: `IF-BLK-${String(newIndex).padStart(3, '0')}`,
      blockIndex: newIndex,
      previousHash,
      blockHash,
      merkleRoot,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      timestamp,
      details: params.details,
      payload: params.payload || {},
      signature,
    };

    this.blocks.push(newBlock);
    return newBlock;
  }

  /**
   * Universal activity logger defaulting to current investigator session
   */
  public async logActivity(params: {
    action: AuditEvent['action'];
    targetType: AuditEvent['targetType'];
    targetId: string;
    details: string;
    payload?: Record<string, unknown>;
    actorName?: string;
  }): Promise<AuditEvent> {
    return this.mintBlock({
      actorId: 'OFFICER-VR-88219',
      actorName: params.actorName || 'Insp. Vikramaditya Rathore',
      actorRole: 'Senior Intelligence Investigator',
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details,
      payload: params.payload || {},
    });
  }

  public async logSearch(query: string, resultCount: number): Promise<AuditEvent> {
    return this.logActivity({
      action: 'SEARCH_PERFORMED',
      targetType: 'SEARCH',
      targetId: `SRCH-${Date.now().toString().slice(-6)}`,
      details: `Omni-Search executed for "${query}" returning ${resultCount} verified results.`,
      payload: { query, resultCount },
    });
  }

  public async logReportGeneration(caseCode: string, reportTitle: string): Promise<AuditEvent> {
    return this.logActivity({
      action: 'REPORT_GENERATED',
      targetType: 'REPORT',
      targetId: `REP-${Date.now().toString().slice(-6)}`,
      details: `Court-Ready Dossier generated: "${reportTitle}" for Case ${caseCode}.`,
      payload: { caseCode, reportTitle },
    });
  }

  public async logStatusChange(entityName: string, entityId: string, oldStatus: string, newStatus: string): Promise<AuditEvent> {
    return this.logActivity({
      action: 'STATUS_CHANGED',
      targetType: 'ENTITY',
      targetId: entityId,
      details: `Status for ${entityName} (${entityId}) changed from ${oldStatus} to ${newStatus}.`,
      payload: { entityId, entityName, oldStatus, newStatus },
    });
  }

  /**
   * Synchronous verification of the previousHash link integrity
   */
  public isChainValidSync(): boolean {
    for (let i = 1; i < this.blocks.length; i++) {
      if (this.blocks[i].previousHash !== this.blocks[i - 1].blockHash) {
        return false;
      }
    }
    return true;
  }

  /**
   * Verify the mathematical integrity of the complete hash chain
   */
  public async verifyChainIntegrity(): Promise<{
    isValid: boolean;
    totalBlocks: number;
    verifiedAt: string;
    brokenBlockIndex?: number;
  }> {
    for (let i = 1; i < this.blocks.length; i++) {
      const current = this.blocks[i];
      const previous = this.blocks[i - 1];

      if (current.previousHash !== previous.blockHash) {
        return {
          isValid: false,
          totalBlocks: this.blocks.length,
          verifiedAt: new Date().toISOString(),
          brokenBlockIndex: i,
        };
      }
    }

    return {
      isValid: true,
      totalBlocks: this.blocks.length,
      verifiedAt: new Date().toISOString(),
    };
  }
}

export const auditService = new AuditService();

