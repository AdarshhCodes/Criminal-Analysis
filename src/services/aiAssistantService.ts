/**
 * ==============================================================================
 * INTEL-FORGE AI INVESTIGATION ASSISTANT SERVICE
 * ==============================================================================
 * ARCHITECTURAL INTEGRITY NOTICE:
 * This service implements a structured, deterministic MOCK AI Assistant layer.
 * While presented in the user interface as an advanced multi-agent copilot for
 * law enforcement decision support, it executes locally against our curated
 * investigation dataset without calling third-party proprietary LLM APIs.
 *
 * This design is deliberately architected with an honest client-adapter interface
 * (e.g. mockGenerateAiInvestigationResponse) so that when production LLMs (such as
 * Google Gemini 1.5 Pro, Anthropic Claude, or on-premise fine-tuned models) are
 * integrated, the service contract, prompt schemas, citations model, and decision
 * support disclaimer boundaries will remain intact and directly swappable.
 * ==============================================================================
 */

import { Entity, Evidence, Relationship, Case } from '../types';
import { investigationService } from './investigationService';
import { evidenceService } from './evidenceService';
import { auditService } from './auditService';

export type AiCapabilityType =
  | 'PATTERN_DETECTION'
  | 'CONNECTION_DISCOVERY'
  | 'CASE_SUMMARY'
  | 'PERSON_INVOLVEMENT'
  | 'REPEATED_ENTITIES'
  | 'TRANSACTION_ANOMALIES'
  | 'INVESTIGATION_AREAS'
  | 'DATA_QUERY';

export interface AiAgentStep {
  agentName: string;
  status: 'COMPLETED' | 'PROCESSING' | 'FLAGGED';
  finding: string;
  durationMs: number;
}

export interface AiCitations {
  entities: Entity[];
  evidence: Evidence[];
  relationships: Relationship[];
  caseItem?: Case;
}

export interface AiAssistantMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  timestamp: string;
  text: string;
  capabilityType?: AiCapabilityType;
  confidence?: number;
  decisionSupportDisclaimer: string;
  reasoningSummary?: string;
  agentSteps?: AiAgentStep[];
  citations?: AiCitations;
  suggestedActions?: string[];
  followUpQuestions?: string[];
}

export const DECISION_SUPPORT_DISCLAIMER =
  'INVESTIGATIVE DECISION SUPPORT ONLY · NON-AUTHORITATIVE HYPOTHESIS · REQUIRES HUMAN OFFICER VERIFICATION UNDER SECTION 65B IEA';

class MockAiInvestigationAssistantService {
  /**
   * Primary Mock AI Generation pipeline.
   * Grounded strictly in the fictional investigation dataset.
   */
  public async mockGenerateAiInvestigationResponse(
    userQuery: string,
    caseId?: string,
    investigatorName: string = 'Insp. Vikramaditya Rathore'
  ): Promise<AiAssistantMessage> {
    const q = userQuery.trim().toLowerCase();
    const activeCase =
      investigationService.getCaseById(caseId || 'IF-CASE-2026-0882') ||
      investigationService.getCases()[0];

    // Simulate realistic multi-agent execution latency (250-600ms)
    await new Promise((resolve) => setTimeout(resolve, 350));

    let capabilityType: AiCapabilityType = 'DATA_QUERY';
    let text = '';
    let confidence = 92;
    let reasoningSummary = '';
    let agentSteps: AiAgentStep[] = [];
    const citedEntityIds: string[] = [];
    const citedEvidenceIds: string[] = [];
    const citedRelIds: string[] = [];
    let suggestedActions: string[] = [];
    let followUpQuestions: string[] = [];

    // --------------------------------------------------------------------------
    // 1. PATTERN DETECTION: Identify Unusual Patterns
    // --------------------------------------------------------------------------
    if (
      q.includes('unusual pattern') ||
      q.includes('pattern') ||
      q.includes('anomaly') ||
      q.includes('irregular') ||
      q.includes('smurf')
    ) {
      capabilityType = 'PATTERN_DETECTION';
      confidence = 94;
      text =
        `Identified 3 high-severity operational anomalies across active dockets:\n\n` +
        `1. **Structured Cash Deposit Smurfing (Karol Bagh Corridor)**: 24 distinct cash deposits of exactly ₹1,99,000 were logged into Surya Bullion accounts within a 4-hour window on 2026-09-02. This deliberate placement just beneath the mandatory ₹2,00,000 FIU reporting threshold matches known hawala layering patterns.\n\n` +
        `2. **Burner SIM Activation Bursts (Seelampur Cluster)**: 45 burner SIMs were provisioned using forged e-KYC documents from a single retail kiosk (IF-LOC-004) in East Delhi within 48 hours. Sequential IMEI registration tags indicate automated batch activation.\n\n` +
        `3. **Cross-Case Financial Siphoning**: Extortion deposits generated under Operation Rakshak are being redirected to Operation Falcon Hawala Escrow (IF-ACC-002) via mule aggregator Sameer Merchant (IF-P-063) within 48 hours of extortion collection.`;

      reasoningSummary =
        'Cross-referenced banking STR ledgers with CDR activation timestamps. Mathematical frequency distributions isolate non-random clustering in deposit timing and hardware IMEI sequences.';

      agentSteps = [
        {
          agentName: 'Fraud Velocity Agent',
          status: 'COMPLETED',
          finding: 'Detected 24 sub-₹2L structured deposits totaling ₹47.76 Lakh in 4 hours.',
          durationMs: 42,
        },
        {
          agentName: 'Telecom Specialist Agent',
          status: 'COMPLETED',
          finding: 'Isolated 45 SIMs registered to synthetic Aadhaar UIDAI-SYN-4412-8899 at Seelampur kiosk.',
          durationMs: 65,
        },
        {
          agentName: 'Cross-Case Graph Agent',
          status: 'COMPLETED',
          finding: 'Mapped 48-hour temporal synchronization between Rakshak extortion cycle and Falcon hawala transfer.',
          durationMs: 78,
        },
      ];

      citedEntityIds.push('IF-P-007', 'IF-P-018', 'IF-P-063', 'IF-ACC-002', 'IF-LOC-004');
      citedEvidenceIds.push('IF-EVD-005', 'IF-EVD-008', 'IF-EVD-022');
      citedRelIds.push('IF-REL-016', 'IF-REL-017', 'IF-REL-X01');

      suggestedActions = [
        'Issue Section 102 CrPC debit-freeze on Union Commercial Bank A/c #440182',
        'Direct Special Cell team to seal Seelampur retail shop #22 for forensic terminal recovery',
        'Request NPCI fast-track trail logs for Sameer Merchant UPI aggregator handle',
      ];

      followUpQuestions = [
        'Show all transactions under ₹2 Lakh in the last 14 days',
        'Who authorized the forged e-KYC SIMs at the Seelampur outlet?',
        'Highlight the cross-case connection between Sameer Merchant and Falcon',
      ];
    }

    // --------------------------------------------------------------------------
    // 2. CONNECTION DISCOVERY: Highlight Possible Connections
    // --------------------------------------------------------------------------
    else if (
      (q.includes('connection') || q.includes('connect') || q.includes('bridge') || q.includes('between')) &&
      (q.includes('rajesh') || q.includes('amit') || q.includes('sameer') || q.includes('cross') || q.includes('possible'))
    ) {
      capabilityType = 'CONNECTION_DISCOVERY';
      confidence = 96;

      if (q.includes('sameer') || q.includes('cross')) {
        text =
          `Discovered a cross-case operational conduit connecting **Operation Rakshak (Cyber-Extortion)** to **Operation Falcon (Hawala Syndicate)**:\n\n` +
          `• **Intermediary Node**: Sameer Merchant (IF-P-063), primary mule aggregator in the student sextortion racket.\n` +
          `• **Transaction Conduit**: Relationship IF-REL-X01 records a ₹8,20,000 transfer from Canara Bank mule A/c #4091823901 directly into SBI Hawala Transit Escrow IF-ACC-002.\n` +
          `• **Operational Hypothesis**: The Rakshak extortion syndicate lacks domestic laundering channels and contracts the Falcon hawala apparatus to convert liquid UPI extortion proceeds into untraceable Dubai bullion assets.`;

        citedEntityIds.push('IF-P-063', 'IF-P-060', 'IF-ACC-002', 'IF-P-001');
        citedEvidenceIds.push('IF-EVD-022', 'IF-EVD-005');
        citedRelIds.push('IF-REL-X01');
      } else {
        text =
          `Discovered a verified 3-hop operational bridge connecting **Rajesh Kumar (IF-P-001)** to **Amit Sharma (IF-P-007)**:\n\n` +
          `1. **Hop 1**: Rajesh Kumar (+91 98110 22341) ──➔ Burner Relay Phone (+91 91200 44819)\n` +
          `2. **Hop 2**: Burner Relay Phone ──➔ Intermediary Burner Line (+91 98712 99014)\n` +
          `3. **Hop 3**: Intermediary Burner Line ──➔ Amit Sharma (+91 98711 00219)\n\n` +
          `**Forensic Timing**: Telephonic handshake occurred at 22:30 IST on 2026-09-10, exactly 15 minutes prior to an RTGS wire transfer of ₹1.85 Crore from Surya Bullion to Apex Global Trading.`;

        citedEntityIds.push('IF-P-001', 'IF-PH-001', 'IF-PH-004', 'IF-PH-002', 'IF-P-007');
        citedEvidenceIds.push('IF-EVD-002', 'IF-EVD-005', 'IF-EVD-006');
        citedRelIds.push('IF-REL-001', 'IF-REL-016', 'IF-REL-017', 'IF-REL-002');
      }

      reasoningSummary =
        'Graph analytics engine executed Dijkstra shortest-path traversal constrained by temporal proximity (<30 mins) and financial counterparty records.';

      agentSteps = [
        {
          agentName: 'Graph Analytics Agent',
          status: 'COMPLETED',
          finding: 'Synthesized 3-hop multi-modal bridge between targets with 96% path weight.',
          durationMs: 38,
        },
        {
          agentName: 'Telecom Specialist Agent',
          status: 'COMPLETED',
          finding: 'Verified cell tower coordinates in Vasant Vihar and Karol Bagh matching call sequence.',
          durationMs: 52,
        },
      ];

      suggestedActions = [
        'Review cell tower triangulations for burner phone +91 91200 44819',
        'Submit digital certificate under Section 65B for CDR call transcripts',
        'Cross-examine Amit Sharma regarding the 22:45 IST RTGS wire execution',
      ];

      followUpQuestions = [
        'Who owns burner phone +91 91200 44819?',
        'What other transactions occurred between Surya Bullion and Apex Global?',
        'Are there any overseas connections linked to Rajesh Kumar?',
      ];
    }

    // --------------------------------------------------------------------------
    // 3. CASE SUMMARY / GENERATE CASE SUMMARIES
    // --------------------------------------------------------------------------
    else if (
      q.includes('case summary') ||
      q.includes('summarize case') ||
      q.includes('generate case') ||
      q.includes('overview of case') ||
      q.includes('falcon') ||
      q.includes('rakshak') ||
      q.includes('chimera') ||
      q.includes('trishul')
    ) {
      capabilityType = 'CASE_SUMMARY';
      confidence = 98;

      let targetCase = activeCase;
      if (q.includes('rakshak')) {
        targetCase = investigationService.getCaseById('IF-CASE-2026-0741') || activeCase;
      } else if (q.includes('chimera')) {
        targetCase = investigationService.getCaseById('IF-CASE-2026-0519') || activeCase;
      } else if (q.includes('trishul')) {
        targetCase = investigationService.getCaseById('IF-CASE-2026-0312') || activeCase;
      }

      text =
        `### Case Brief: ${targetCase.name} (${targetCase.code})\n\n` +
        `• **Operational Status**: ${targetCase.status} // Priority: ${targetCase.priority}\n` +
        `• **Assigned Unit**: ${targetCase.assignedUnit}\n` +
        `• **Lead Investigator**: ${targetCase.leadInvestigator}\n` +
        `• **Applicable Legal Provisions**: Section 65B Indian Evidence Act, Section 420/467/471/120B IPC, Section 66C/66D IT Act, Section 3/4 PMLA\n\n` +
        `**Executive Summary**:\n` +
        `${targetCase.description}\n\n` +
        `**Key Metrics & Dimensions**:\n` +
        `• **Total Financial Volume Tracked**: ${targetCase.financialActivity?.totalVolume || '₹48.6 Crore'}\n` +
        `• **Mapped Entities**: ${targetCase.entityIds.length} Nodes (Persons, Phones, Accounts, Safehouses)\n` +
        `• **Seized Exhibits in Vault**: ${targetCase.evidenceCount || 16} Certified Exhibits\n` +
        `• **Primary Modus Operandi**: Structured smurfing, burner phone relay networks, offshore foreign exchange Hawala conduits, and commercial shell invoicing.`;

      reasoningSummary =
        'Synthesized dossier from active case docket, MCA-21 company registry records, and FIU-IND banking logs.';

      agentSteps = [
        {
          agentName: 'Orchestrator Agent',
          status: 'COMPLETED',
          finding: `Compiled multi-source case dossier for ${targetCase.code}.`,
          durationMs: 30,
        },
        {
          agentName: 'Legal Compliance Agent',
          status: 'COMPLETED',
          finding: 'Verified all statutory citations and Section 65B court admissibility standards.',
          durationMs: 44,
        },
      ];

      citedEntityIds.push(...targetCase.entityIds.slice(0, 4));
      citedEvidenceIds.push('IF-EVD-001', 'IF-EVD-002');

      suggestedActions = [
        `Export complete Court-Ready Dossier for ${targetCase.code} in Reports`,
        'Verify pending AI-suggested relationship leads in Network Graph',
        'Review current timeline events and upcoming raid windows',
      ];

      followUpQuestions = [
        `Who are the primary accused in ${targetCase.code}?`,
        `What evidence items have been cryptographically sealed for this case?`,
        'Identify unusual patterns in this case',
      ];
    }

    // --------------------------------------------------------------------------
    // 4. PERSON'S INVOLVEMENT: Summarize a Person's Involvement
    // --------------------------------------------------------------------------
    else if (
      q.includes('person') ||
      q.includes('involvement') ||
      q.includes('rajesh') ||
      q.includes('amit') ||
      q.includes('sameer') ||
      q.includes('pooja') ||
      q.includes('vikram') ||
      q.includes('dinesh') ||
      q.includes('who is')
    ) {
      capabilityType = 'PERSON_INVOLVEMENT';
      confidence = 95;

      let targetPersonId = 'IF-P-001';

      if (q.includes('amit')) {
        targetPersonId = 'IF-P-007';
      } else if (q.includes('sameer')) {
        targetPersonId = 'IF-P-063';
      } else if (q.includes('pooja')) {
        targetPersonId = 'IF-P-018';
      } else if (q.includes('dinesh')) {
        targetPersonId = 'IF-P-070';
      } else if (q.includes('vikram')) {
        targetPersonId = 'IF-P-012';
      }

      const entity = investigationService.getEntityById(targetPersonId) || investigationService.getEntities()[0];
      const crossCases = investigationService.getCrossAppearances(entity.id);

      text =
        `### Subject Profile: ${entity.name} (${entity.id})\n\n` +
        `• **Operational Role**: ${entity.role}\n` +
        `• **Legal Classification**: ${entity.personClassification || 'ACCUSED'}\n` +
        `• **Threat Index Score**: **${entity.riskScore} / 100** [${entity.riskScore >= 85 ? 'CRITICAL THREAT' : 'HIGH THREAT'}]\n` +
        `• **Primary Identifier**: ${entity.primaryIdentifier}\n` +
        `• **Known Aliases**: ${entity.aliases?.join(', ') || 'None recorded'}\n` +
        `• **Cross-Case Footprint**: Active in ${crossCases.length > 0 ? crossCases.length + 1 : 1} investigative dockets\n\n` +
        `**Investigative Summary**:\n` +
        `${entity.notes || 'Identified through telephonic wiretap and physical co-location surveillance.'}\n\n` +
        `**Associated Assets & Conduits**:\n` +
        `• Beneficial owner / proxy controller for shell companies and merchant accounts.\n` +
        `• Intercepted communicating across encrypted VoIP channels and burner lines.\n` +
        `• Flight Risk: High (maintains offshore addresses and cross-border bank links).`;

      reasoningSummary =
        'Aggregated entity graph degrees, betweenness centrality index, and biometric identifier matches across all active case dockets.';

      agentSteps = [
        {
          agentName: 'Graph Analytics Agent',
          status: 'COMPLETED',
          finding: `Calculated degree centrality (${entity.riskScore}) and cross-case connections for ${entity.name}.`,
          durationMs: 36,
        },
        {
          agentName: 'Telecom Specialist Agent',
          status: 'COMPLETED',
          finding: 'Linked subject to 3 active burner IMEI handshakes in Delhi NCR.',
          durationMs: 48,
        },
      ];

      citedEntityIds.push(entity.id);
      citedEvidenceIds.push('IF-EVD-001', 'IF-EVD-005');

      suggestedActions = [
        `Inspect ${entity.name} in Network Graph visualization`,
        `Generate dedicated Person Summary Report for ${entity.name}`,
        'Issue Lookout Circular (LOC) to Bureau of Immigration',
      ];

      followUpQuestions = [
        `Who are the direct associates of ${entity.name}?`,
        `What bank accounts are registered under ${entity.name}?`,
        `Show phone call timeline involving ${entity.name}`,
      ];
    }

    // --------------------------------------------------------------------------
    // 5. REPEATED NAMES / ENTITIES: Identify Repeated Names & Entities Across Cases
    // --------------------------------------------------------------------------
    else if (
      q.includes('repeated') ||
      q.includes('duplicate') ||
      q.includes('cross-case') ||
      q.includes('multiple case') ||
      q.includes('same person') ||
      q.includes('shared')
    ) {
      capabilityType = 'REPEATED_ENTITIES';
      confidence = 97;

      text =
        `### Repeated Cross-Case Entities & Overlaps Identified\n\n` +
        `Cross-referencing entity registries across all 6 active operations isolated multiple critical nodes appearing across distinct FIRs:\n\n` +
        `1. **Sameer Merchant (IF-P-063)**:\n` +
        `   • Primary Role: Mule Account Aggregator & Cash Courier Coordinator\n` +
        `   • Appearing in: **Operation Rakshak** (Cyber-Extortion) AND **Operation Falcon** (Hawala Syndicate)\n` +
        `   • Nexus: Direct financial conduit IF-REL-X01 transferring ₹8.2 Lakh from student extortion victims into Falcon's primary hawala escrow.\n\n` +
        `2. **SBI Hawala Transit Corridor (IF-ACC-002)**:\n` +
        `   • Primary Role: Multi-Syndicate Pooling Escrow Account\n` +
        `   • Appearing in: Both Falcon foreign remittances and Rakshak domestic mule dispersal.\n` +
        `   • Total Inward Flow: ₹14.8 Crore across multiple operational cycles.\n\n` +
        `3. **Seelampur Burner Telecom Outlet (IF-LOC-004)**:\n` +
        `   • Primary Role: Wholesale Forged e-KYC SIM Retailer\n` +
        `   • Shared Infrastructure: Supplied burner batches to both Operation Falcon couriers and Operation Chimera instant-loan phishing operatives.`;

      reasoningSummary =
        'Cross-case entity resolver matched PAN, Aadhaar hash digests, and bank account numbers across independent case registries.';

      agentSteps = [
        {
          agentName: 'Cross-Case Entity Resolver',
          status: 'COMPLETED',
          finding: 'Identified 3 high-confidence identity overlaps across separate FIR jurisdictions.',
          durationMs: 64,
        },
        {
          agentName: 'Pattern Matching Agent',
          status: 'COMPLETED',
          finding: 'Confirmed exact PAN and account number match on IF-ACC-002 across two case dockets.',
          durationMs: 40,
        },
      ];

      citedEntityIds.push('IF-P-063', 'IF-ACC-002', 'IF-LOC-004');
      citedEvidenceIds.push('IF-EVD-022', 'IF-EVD-008');
      citedRelIds.push('IF-REL-X01');

      suggestedActions = [
        'Open Cross-Case People Analytics section in Investigations Workspace',
        'Consolidate Rakshak and Falcon FIRs under joint Special Operations Taskforce',
        'Interrogate Sameer Merchant specifically on his instructions from Rajesh Kumar',
      ];

      followUpQuestions = [
        'Show all financial connections involving Sameer Merchant',
        'What other shell companies use SBI Hawala Account IF-ACC-002?',
        'Suggest next investigation steps for cross-case links',
      ];
    }

    // --------------------------------------------------------------------------
    // 6. TRANSACTION ANOMALIES: Detect Unusual Transaction Patterns
    // --------------------------------------------------------------------------
    else if (
      q.includes('transaction') ||
      q.includes('money') ||
      q.includes('hawala') ||
      q.includes('financial') ||
      q.includes('bank') ||
      q.includes('rtgs') ||
      q.includes('smurfing')
    ) {
      capabilityType = 'TRANSACTION_ANOMALIES';
      confidence = 96;

      text =
        `### Forensic Financial Anomaly Detection Report\n\n` +
        `Automated transaction parsing of 184 banking ledgers and FIU-IND Suspicious Transaction Reports (STRs) flagged the following anomalies:\n\n` +
        `1. **Structuring / Smurfing Velocity**:\n` +
        `   • ₹48,00,000 deposited across 24 structured tranches of ₹1,99,000 at cash deposit machines in Karol Bagh on 2026-09-02.\n` +
        `   • Avoided mandatory automated reporting threshold of ₹2,00,000.\n\n` +
        `2. **Temporal Correlation with Burner Calls**:\n` +
        `   • ₹1,85,00,000 RTGS transfer from Surya Bullion (#440182) to Apex Global (#991024) executed at 22:45 IST on 2026-09-10.\n` +
        `   • Intercepted burner call between Rajesh Kumar and Amit Sharma concluded at 22:30 IST — an exact 15-minute operational trigger window.\n\n` +
        `3. **Offshore Capital Flight**:\n` +
        `   • ₹4,20,00,000 telegraphic transfer from Apex Global to Al-Noor Currency Services LLC in Deira, Dubai, billed as "synthetic textile machinery import" without customs bill of entry.`;

      reasoningSummary =
        'Financial Agent parsed SWIFT MT-103 and RTGS clearing messages against RBI AML thresholds and telecom call times.';

      agentSteps = [
        {
          agentName: 'Financial Specialist Agent',
          status: 'COMPLETED',
          finding: 'Flagged 3 high-risk money laundering typologies under PMLA Section 3/4.',
          durationMs: 58,
        },
        {
          agentName: 'Telecom Specialist Agent',
          status: 'COMPLETED',
          finding: 'Correlated 15-minute trigger gap between burner call and RTGS wire dispatch.',
          durationMs: 44,
        },
      ];

      citedEntityIds.push('IF-ACC-001', 'IF-ACC-002', 'IF-ORG-001', 'IF-ORG-002');
      citedEvidenceIds.push('IF-EVD-005', 'IF-EVD-006');

      suggestedActions = [
        'Serve Section 102 CrPC notices to Federal Merchant Bank and Union Commercial Bank',
        'Request FIU-IND to initiate Egmont Group overseas query with UAE Financial Intelligence Unit',
        'Freeze Apex Global Trading account #991024',
      ];

      followUpQuestions = [
        'Which shell companies are linked to Apex Global Trading?',
        'Who authorized the telegraphic wire to Al-Noor Currency in Dubai?',
        'Show all high-value transactions above ₹1 Crore',
      ];
    }

    // --------------------------------------------------------------------------
    // 7. INVESTIGATION AREAS: Suggest Investigation Areas & Next Steps
    // --------------------------------------------------------------------------
    else if (
      q.includes('suggest') ||
      q.includes('investigation area') ||
      q.includes('next step') ||
      q.includes('what should we do') ||
      q.includes('recommend') ||
      q.includes('action') ||
      q.includes('where to look')
    ) {
      capabilityType = 'INVESTIGATION_AREAS';
      confidence = 93;

      text =
        `### Recommended Tactical Investigation Areas & Priority Actions\n\n` +
        `Based on current graph density, evidence custody seals, and flight-risk analytics, the following immediate operational areas are recommended:\n\n` +
        `1. **Interdict Okhla Logistics Warehouse #14**:\n` +
        `   • Seize unmanifested currency-counting machines and DVR surveillance hard drives before physical evidence tampering occurs.\n` +
        `   • Statutory Basis: Section 165 CrPC emergency search warrant.\n\n` +
        `2. **Execute Section 102 CrPC Bank Debit Freezes**:\n` +
        `   • Immediate freeze on Federal Merchant Bank A/c #991024 (Apex Global) with estimated liquid balance of ₹2.4 Crore.\n` +
        `   • Immediate freeze on Canara Bank Mule A/c #4091823901 (Sameer Merchant) to sever Rakshak-Falcon cash siphoning.\n\n` +
        `3. **Issue Lookout Circulars (LOC) with Bureau of Immigration**:\n` +
        `   • Issue LOC against Rajesh Kumar (Passport Z-8821903) and Amit Sharma to prevent cross-border transit to Dubai/Nepal.\n\n` +
        `4. **Section 65B Deposition & Special Court Filing**:\n` +
        `   • Formalize electronic evidence certificates for wiretap intercept WT-26-088 and CDR logs for presentation before the Special Judge, Patiala House Courts.`;

      reasoningSummary =
        'Predictive risk model computed lead closure rates, asset dissipation probabilities, and statutory procedural timelines.';

      agentSteps = [
        {
          agentName: 'Predictive Pattern Agent',
          status: 'COMPLETED',
          finding: 'Calculated 88% probability of asset dissipation within 72 hours unless accounts are frozen.',
          durationMs: 40,
        },
        {
          agentName: 'Legal Compliance Agent',
          status: 'COMPLETED',
          finding: 'Prepared Section 102 CrPC and Section 65B draft affidavits.',
          durationMs: 35,
        },
      ];

      suggestedActions = [
        'Generate Section 65B Certified Dossier in Reports section',
        'Review Okhla Warehouse #14 entry on Geographic Analysis report',
        'Inspect critical targets list in Environment Summary',
      ];

      followUpQuestions = [
        'What evidence exists against Rajesh Kumar for an arrest warrant?',
        'How much money can be recovered by freezing the active accounts?',
        'Summarize the involvement of Amit Sharma',
      ];
    }

    // --------------------------------------------------------------------------
    // 8. GENERAL INVESTIGATION DATA QUERY (Fallback)
    // --------------------------------------------------------------------------
    else {
      capabilityType = 'DATA_QUERY';
      confidence = 90;

      const matchedEntities = investigationService.getEntities('ALL').filter((e) =>
        e.name.toLowerCase().includes(q) ||
        (e.role && e.role.toLowerCase().includes(q)) ||
        (e.aliases && e.aliases.some((a) => a.toLowerCase().includes(q)))
      );

      const topEntity = matchedEntities[0];

      text = topEntity
        ? `Investigation scan located entity **${topEntity.name}** (${topEntity.id}): Role: ${topEntity.role}, Risk Score: ${topEntity.riskScore}/100. ${topEntity.notes || 'Identified via multi-source intelligence records.'}`
        : `Investigation search scan completed across ${investigationService.getCases().length} active operations. The dataset currently indexes 65+ entities, 35+ certified evidence exhibits, and ₹202.0 Crore in tracked financial flows across Delhi NCR, Mumbai, and international jurisdictions.\n\nYou can ask me to:\n• **Identify unusual patterns** (cash smurfing, burner SIM bursts)\n• **Highlight possible connections** (cross-case links, 3-hop bridges)\n• **Summarize a case** (Operation Falcon, Rakshak, Chimera)\n• **Summarize a person's involvement** (Rajesh Kumar, Amit Sharma)\n• **Detect unusual transaction patterns** (Hawala routing, structured wires)\n• **Suggest investigation areas** (warrants, account freezes, raids)`;

      reasoningSummary =
        'Full-text semantic tokenizer matched query terms against indexed entity registries, evidence vaults, and chronological incident logs.';

      agentSteps = [
        {
          agentName: 'Orchestrator Agent',
          status: 'COMPLETED',
          finding: `Queried portfolio knowledge base for "${userQuery}".`,
          durationMs: 25,
        },
      ];

      if (topEntity) citedEntityIds.push(topEntity.id);
      citedEvidenceIds.push('IF-EVD-001', 'IF-EVD-002');

      suggestedActions = [
        'Identify unusual patterns in current case',
        'Highlight possible connections between key targets',
        'Generate case summary report',
      ];

      followUpQuestions = [
        'Show me the strongest connection between Rajesh Kumar and Amit Sharma',
        'Find suspicious transactions involving these suspects',
        'Suggest next investigation steps',
      ];
    }

    // Resolve citations
    const entities = citedEntityIds
      .map((id) => investigationService.getEntityById(id))
      .filter((e): e is Entity => Boolean(e));

    const evidence = citedEvidenceIds
      .map((id) => evidenceService.getEvidenceById(id))
      .filter((ev): ev is Evidence => Boolean(ev));

    const relationships = citedRelIds
      .map((id) => investigationService.getRelationshipById(id))
      .filter((r): r is Relationship => Boolean(r));

    // Log query in audit ledger
    await auditService.logActivity({
      actorName: investigatorName,
      action: 'AI_QUERY_EXECUTED',
      targetType: 'QUERY',
      targetId: `AI-${Date.now().toString().slice(-6)}`,
      details: `AI Copilot Decision Support query executed by ${investigatorName}: "${userQuery.slice(0, 50)}" [${capabilityType}]`,
      payload: { capabilityType, confidence, query: userQuery, investigator: investigatorName },
    });

    return {
      id: `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: 'ASSISTANT',
      timestamp: new Date().toISOString(),
      text,
      capabilityType,
      confidence,
      decisionSupportDisclaimer: DECISION_SUPPORT_DISCLAIMER,
      reasoningSummary,
      agentSteps,
      citations: {
        entities,
        evidence,
        relationships,
        caseItem: activeCase,
      },
      suggestedActions,
      followUpQuestions,
    };
  }
}

export const aiAssistantService = new MockAiInvestigationAssistantService();
