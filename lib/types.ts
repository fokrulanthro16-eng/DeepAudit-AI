export type Verdict = "VERIFIED" | "CONTRADICTORY" | "DEBUNKED" | "INCONCLUSIVE";

export interface EvidenceItem {
  id: string;
  query: string;
  queryType: "confirmation" | "refutation";
  url: string;
  title: string;
  content: string;
  source: string;
  publishedDate?: string;
  sha256Hash: string;
  frozenAtUtc: string;
  relevanceScore?: number;
}

export interface ClaimAudit {
  claimId: string;
  originalClaim: string;
  atomicClaim: string;
  confirmationQuery: string;
  refutationQuery: string;
  verdict: Verdict;
  confidenceScore: number; // 0 - 100
  executiveSummary: string;
  auditFindings: string[];
  riskFlags: string[];
  evidence: EvidenceItem[];
  reasoningTrajectory?: string;
}

export interface AuditReport {
  id: string;
  auditTimestamp: string;
  originalText: string;
  sanitizedText: string;
  piiRedactedCount: number;
  piiItemsScrubbed: string[];
  totalClaimsAudited: number;
  overallScore: number;
  overallVerdict: Verdict;
  executiveSummary: string;
  claims: ClaimAudit[];
  meta: {
    nebiusModel: string;
    nebiusBaseUrl: string;
    tavilySearchDepth: string;
    forensicStandard: string;
    processingTimeMs: number;
    airlockActive: boolean;
    strictGrounding: boolean;
  };
}

export interface PipelineStage {
  id: number;
  name: string;
  description: string;
  status: "idle" | "running" | "completed" | "error";
  durationMs?: number;
  details?: string;
}
