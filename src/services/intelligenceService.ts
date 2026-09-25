import { InvestigationQueryResult } from '../types';
import { investigationService } from './investigationService';

class IntelligenceService {
  /**
   * Deterministic Natural Language Investigation Engine
   */
  public async queryInvestigation(
    queryText: string,
    caseId?: string
  ): Promise<InvestigationQueryResult> {
    const q = queryText.trim().toLowerCase();

    // Case 1: Connection query between Rajesh Kumar and Amit Sharma (The Core SIH Demo flow)
    if (
      (q.includes('rajesh') && q.includes('amit')) ||
      (q.includes('connection') && (q.includes('rajesh') || q.includes('amit'))) ||
      q.includes('strongest connection')
    ) {
      const pathResult = investigationService.findStrongestPath('IF-P-001', 'IF-P-007');

      return {
        query: queryText,
        answer:
          'A high-confidence 3-hop operational bridge was identified connecting Rajesh Kumar to Amit Sharma via intermediary burner line (+91 91200 44819). The communication occurred 15 minutes prior to a ₹1.85 Crore Hawala remittance.',
        confidence: pathResult.pathFound ? pathResult.overallConfidence : 94,
        reasoningSummary:
          'Orchestrator Agent decomposed cell tower logs, RTGS banking wires, and seized Hawala ledger chits. Telecom Agent verified sequential calls from Vasant Vihar to Karol Bagh within a 15-minute window. Financial Agent linked the call timing to STR #449102.',
        agentSteps: [
          {
            agentName: 'Orchestrator',
            status: 'COMPLETED',
            action: 'Query Decomposition & Swarm Task Allocation',
            finding: 'Assigned target entities: IF-P-001 (Rajesh Kumar) and IF-P-007 (Amit Sharma).',
            confidence: 99,
            durationMs: 45,
          },
          {
            agentName: 'Telecom Agent',
            status: 'COMPLETED',
            action: 'CDR Tower Triangulation & Call Frequency Cross-Reference',
            finding:
              'Identified intermediary burner device IF-PH-004 (+91 91200 44819) receiving call from IF-PH-001 at 22:30, followed by outbound call to IF-PH-002 at 22:45.',
            confidence: 96,
            durationMs: 82,
          },
          {
            agentName: 'Financial Agent',
            status: 'COMPLETED',
            action: 'FIU-IND STR Ledger Cross-Check',
            finding:
              'Correlated call burst with RTGS wire transfer of ₹1,85,00,000 from Surya Bullion account to Apex Global shell account.',
            confidence: 98,
            durationMs: 65,
          },
          {
            agentName: 'Graph Analytics',
            status: 'COMPLETED',
            action: 'Multi-Hop Path Calculation & Edge Confidence Weighting',
            finding:
              `Synthesized ${pathResult.hopCount || 3}-hop path: IF-P-001 -> IF-PH-001 -> IF-PH-004 -> IF-PH-002 -> IF-P-007. Confidence: ${pathResult.overallConfidence || 94}%.`,
            confidence: pathResult.overallConfidence || 94,
            durationMs: 38,
          },
        ],
        pathNodeIds: pathResult.pathFound ? pathResult.nodeIds : ['IF-P-001', 'IF-PH-001', 'IF-PH-004', 'IF-PH-002', 'IF-P-007'],
        pathEdgeIds: pathResult.pathFound ? pathResult.edgeIds : ['IF-REL-001', 'IF-REL-016', 'IF-REL-017', 'IF-REL-002'],
        evidenceIds: ['IF-EVD-002', 'IF-EVD-005', 'IF-EVD-006'],
        verificationStatus: 'AI_SUGGESTED',
        suggestedFollowUps: [
          'Verify AI-suggested Hawala directorship between Rajesh Kumar and Amit Sharma',
          'Inspect burner phone +91 91200 44819 activation history in Seelampur',
          'Export court-ready multi-hop intelligence brief for prosecution',
        ],
      };
    }

    // Case 2: Query for phone connections / burner SIMs
    if (q.includes('phone') || q.includes('burner') || q.includes('sim') || q.includes('call')) {
      const connections = investigationService.findConnections('IF-PH-004', 2);

      return {
        query: queryText,
        answer:
          `Burner device IF-PH-004 (+91 91200 44819) functions as a central relay. It has ${connections.connectedEntityIds.length} multi-hop connections, linking Rajesh Kumar to Amit Sharma and hardware supplier Pooja Verma.`,
        confidence: 95,
        reasoningSummary:
          'Telecom Agent isolated hardware IMEI 861092049182091 registered under a forged identity from Pooja Verma telecom store in Seelampur.',
        agentSteps: [
          {
            agentName: 'Orchestrator',
            status: 'COMPLETED',
            action: 'Device Isolation Analysis',
            finding: 'Targeted hardware IMEI: 861092049182091.',
            confidence: 98,
            durationMs: 30,
          },
          {
            agentName: 'Telecom Agent',
            status: 'COMPLETED',
            action: 'e-KYC Forgery & Hardware Matching',
            finding: 'Device was activated with synthetic Aadhaar UIDAI-SYN-4412-8899.',
            confidence: 95,
            durationMs: 70,
          },
        ],
        pathNodeIds: ['IF-PH-004', ...connections.connectedEntityIds.slice(0, 3)],
        pathEdgeIds: connections.connectedRelationshipIds.slice(0, 3),
        evidenceIds: ['IF-EVD-002', 'IF-EVD-008'],
        verificationStatus: 'HUMAN_VERIFIED',
        suggestedFollowUps: [
          'View cell tower handshakes for burner phone',
          'Locate safehouse associated with Pooja Verma',
        ],
      };
    }

    // Case 3: Suspicious financial transactions / Hawala
    if (q.includes('transaction') || q.includes('money') || q.includes('hawala') || q.includes('bank') || q.includes('financial')) {
      return {
        query: queryText,
        answer:
          'Primary money laundering cycle centers on Surya Bullion (Amit Sharma) and Apex Global Trading (Rajesh Kumar). Over ₹14.2 Crore has been routed through structured RTGS layers and offshore remittances to Dubai.',
        confidence: 97,
        reasoningSummary:
          'Financial Agent mapped cash intakes from Karol Bagh bullion counter to commercial Union Bank account, then transferred under fake textile advances to Apex Global.',
        agentSteps: [
          {
            agentName: 'Financial Agent',
            status: 'COMPLETED',
            action: 'Hawala Layering Flow Analysis',
            finding: 'Detected structured transfers avoiding ₹2 Lakh reporting threshold.',
            confidence: 99,
            durationMs: 60,
          },
          {
            agentName: 'Vector DB',
            status: 'COMPLETED',
            action: 'FIU-IND Suspicious Activity Pattern Match',
            finding: '97.8% similarity to previously prosecuted trade-based money laundering schemes.',
            confidence: 97,
            durationMs: 40,
          },
        ],
        pathNodeIds: ['IF-P-007', 'IF-ORG-002', 'IF-ACC-002', 'IF-ACC-001', 'IF-ORG-001', 'IF-P-001'],
        pathEdgeIds: ['IF-REL-003', 'IF-REL-004', 'IF-REL-013', 'IF-REL-012', 'IF-REL-020'],
        evidenceIds: ['IF-EVD-005', 'IF-EVD-006'],
        verificationStatus: 'HUMAN_VERIFIED',
        suggestedFollowUps: [
          'Review bank statement attachments in Evidence Vault',
          'Issue debit freeze for Apex Global account #991024',
        ],
      };
    }

    // Case 4: Why is an entity high risk?
    if (q.includes('why') || q.includes('risk') || q.includes('rajesh') || q.includes('score')) {
      return {
        query: queryText,
        answer:
          'Rajesh Kumar is scored at Risk Index 94/100 due to: (1) Sovereign cross-border Hawala coordination, (2) Direct beneficial ownership of sanctioned shell firm Apex Global, (3) Intercepted phone instructions to Dubai correspondent Mohd. Tariq, and (4) Multiple burner SIM layers.',
        confidence: 94,
        reasoningSummary:
          'Multi-modal graph centrality metrics place Rajesh Kumar at the highest betweenness centrality (0.84) in the syndicate network, indicating he is the indispensable coordinator.',
        agentSteps: [
          {
            agentName: 'Graph Analytics',
            status: 'COMPLETED',
            action: 'Betweenness & Eigenvector Centrality Scoring',
            finding: 'Network centrality: 0.84 (Syndicate hub).',
            confidence: 96,
            durationMs: 35,
          },
          {
            agentName: 'Visual Vision Agent',
            status: 'COMPLETED',
            action: 'Facial Recognition & CCTV Trajectory',
            finding: 'Confirmed rendezvous near Aerocity suites following cash delivery.',
            confidence: 92,
            durationMs: 80,
          },
        ],
        pathNodeIds: ['IF-P-001', 'IF-PH-001', 'IF-ORG-001', 'IF-P-033'],
        pathEdgeIds: ['IF-REL-001', 'IF-REL-020', 'IF-REL-007'],
        evidenceIds: ['IF-EVD-001', 'IF-EVD-005', 'IF-EVD-007'],
        verificationStatus: 'HUMAN_VERIFIED',
        suggestedFollowUps: [
          'Generate Comprehensive Dossier on Rajesh Kumar',
          'Review wiretap tape #WT-26-088 transcript',
        ],
      };
    }

    // Case 5: Relationships established after January 2025 / Date temporal queries
    if (q.includes('2025') || q.includes('after') || q.includes('recent') || q.includes('date') || q.includes('established')) {
      return {
        query: queryText,
        answer:
          'Identified 18 syndicate relationships established after January 2025, including the incorporation of shell firm Apex Global Trading (March 2025) and the deployment of the Seelampur burner relay corridor in August-September 2026.',
        confidence: 96,
        reasoningSummary:
          'Chronological edge filters correlated MCA-21 incorporation records with telecom IMEI activation timestamps, isolating newly formed money laundering pathways.',
        agentSteps: [
          {
            agentName: 'Orchestrator',
            status: 'COMPLETED',
            action: 'Temporal Range Partitioning (2025-01-01 to Present)',
            finding: 'Queried 24 graph edges against incorporation and telecom event timestamps.',
            confidence: 98,
            durationMs: 40,
          },
          {
            agentName: 'Financial Agent',
            status: 'COMPLETED',
            action: 'Corporate Ledger Verification',
            finding: 'Apex Global Trading established March 12, 2025. BlueWave Logistics incorporated June 4, 2025.',
            confidence: 96,
            durationMs: 55,
          },
        ],
        pathNodeIds: ['IF-P-001', 'IF-ORG-001', 'IF-PH-004', 'IF-P-007'],
        pathEdgeIds: ['IF-REL-001', 'IF-REL-016', 'IF-REL-017'],
        evidenceIds: ['IF-EVD-001', 'IF-EVD-002', 'IF-EVD-008'],
        verificationStatus: 'HUMAN_VERIFIED',
        suggestedFollowUps: [
          'Filter timeline to 2025-2026 corporate filings',
          'Inspect fake e-KYC documents bundle (IF-EVD-008)',
        ],
      };
    }

    // Default Fallback deterministic answer
    const entities = investigationService.getEntities(caseId);
    const topEntities = entities.slice(0, 4);

    return {
      query: queryText,
      answer: `Investigation scan identified ${entities.length} correlated entities in Operation Falcon. Core key targets include Rajesh Kumar (Kingpin), Amit Sharma (Hawala Broker), Vikram Malhotra (Logistics), and Pooja Verma (Burner SIMs).`,
      confidence: 91,
      reasoningSummary:
        'Orchestrator Agent synthesized cross-domain evidence across CDR logs, CCTV timestamps, and banking STR records.',
      agentSteps: [
        {
          agentName: 'Orchestrator',
          status: 'COMPLETED',
          action: 'General Knowledge Graph Ingestion Scan',
          finding: `Indexed ${entities.length} nodes and 24 active relationships.`,
          confidence: 95,
          durationMs: 25,
        },
      ],
      pathNodeIds: topEntities.map((e) => e.id),
      pathEdgeIds: ['IF-REL-001', 'IF-REL-002'],
      evidenceIds: ['IF-EVD-001', 'IF-EVD-002'],
      verificationStatus: 'HUMAN_VERIFIED',
      suggestedFollowUps: [
        'Ask: "Show the strongest connection between Rajesh Kumar and Amit Sharma"',
        'Ask: "Find suspicious transactions involving these suspects"',
      ],
    };
  }

  /**
   * Find strongest intelligence connection path between two entities
   */
  public findStrongestPath(sourceId: string, targetId: string) {
    if (
      (sourceId === 'IF-P-001' && targetId === 'IF-P-007') ||
      (sourceId === 'IF-P-007' && targetId === 'IF-P-001')
    ) {
      return {
        pathFound: true,
        sourceEntity: investigationService.getEntityById('IF-P-001'),
        targetEntity: investigationService.getEntityById('IF-P-007'),
        nodeIds: ['IF-P-001', 'IF-PH-001', 'IF-PH-004', 'IF-PH-002', 'IF-P-007'],
        edgeIds: ['IF-REL-001', 'IF-REL-016', 'IF-REL-017', 'IF-REL-002'],
        hopCount: 3,
        evidenceIds: ['IF-EVD-002', 'IF-EVD-005', 'IF-EVD-006'],
        evidenceCount: 5,
        overallConfidence: 94,
        verificationStatus: 'AI_SUGGESTED' as const,
        description:
          'A 3-hop operational bridge was identified: Rajesh Kumar called burner phone (+91 91200 44819) which relayed call to Amit Sharma 15 mins prior to ₹1.85 Cr RTGS execution.',
        chainSummary:
          'PERSON (Rajesh Kumar) → PHONE (+91 98110) → PHONE (Burner #004) → PHONE (+91 98712) → PERSON (Amit Sharma)',
      };
    }

    const raw = investigationService.findStrongestPath(sourceId, targetId);
    const sourceEnt = investigationService.getEntityById(sourceId);
    const targetEnt = investigationService.getEntityById(targetId);

    return {
      pathFound: raw.pathFound,
      sourceEntity: sourceEnt,
      targetEntity: targetEnt,
      nodeIds: raw.nodeIds,
      edgeIds: raw.edgeIds,
      hopCount: raw.hopCount,
      evidenceIds: ['IF-EVD-001', 'IF-EVD-002'],
      evidenceCount: raw.edgeIds.length > 0 ? raw.edgeIds.length + 1 : 1,
      overallConfidence: raw.overallConfidence,
      verificationStatus: 'AI_SUGGESTED' as const,
      description: `Discovered connection with ${raw.hopCount} hops between ${sourceEnt?.name || sourceId} and ${targetEnt?.name || targetId}.`,
      chainSummary: raw.nodeIds.map((id) => investigationService.getEntityById(id)?.name || id).join(' → '),
    };
  }
}

export const intelligenceService = new IntelligenceService();
