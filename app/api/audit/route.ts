import { NextRequest, NextResponse } from "next/server";
import { scrubPii } from "@/lib/pii";
import { extractClaimsWithNemotron, synthesizeAuditWithNemotron } from "@/lib/nebius";
import { runParallelTavilySearches } from "@/lib/tavily";
import { AuditReport, Verdict } from "@/lib/types";

export const maxDuration = 60; // Next.js serverless timeout ceiling

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const {
      text,
      airlockActive = true,
      strictGrounding = true,
      tavilyApiKey,
    } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'text' payload for due-diligence audit." },
        { status: 400 }
      );
    }

    // Step A: PII Scrubbing Airlock
    let sanitizedText = text;
    let piiRedactedCount = 0;
    let piiItemsScrubbed: string[] = [];

    if (airlockActive) {
      const piiResult = scrubPii(text);
      sanitizedText = piiResult.sanitizedText;
      piiRedactedCount = piiResult.redactedCount;
      piiItemsScrubbed = piiResult.scrubbedItems.map(
        (item) => `${item.type} -> ${item.redactedPlaceholder}`
      );
    }

    // Step B: Tier-1 Claim Extraction & Dual Query Formulation (Nemotron)
    const extractedClaims = await extractClaimsWithNemotron(sanitizedText);

    // Step C & D: Parallel Tavily Web Searches & SHA-256 Forensic Snapshot Hashing
    const evidenceByClaim = await runParallelTavilySearches(
      extractedClaims.map((c) => ({
        claimId: c.claimId,
        confirmationQuery: c.confirmationQuery,
        refutationQuery: c.refutationQuery,
      })),
      tavilyApiKey
    );

    // Step E: Tier-2 Deep Reasoning Synthesis (Nemotron)
    const auditedClaims = await Promise.all(
      extractedClaims.map(async (claim) => {
        const evidence = evidenceByClaim[claim.claimId] || [];
        return await synthesizeAuditWithNemotron(claim, evidence, strictGrounding);
      })
    );

    // Overall verdict calculation
    const verdicts = auditedClaims.map((c) => c.verdict);
    let overallVerdict: Verdict = "VERIFIED";
    if (verdicts.includes("DEBUNKED")) {
      overallVerdict = "DEBUNKED";
    } else if (verdicts.includes("CONTRADICTORY")) {
      overallVerdict = "CONTRADICTORY";
    }

    const averageConfidence = Math.round(
      auditedClaims.reduce((acc, c) => acc + c.confidenceScore, 0) /
        (auditedClaims.length || 1)
    );

    const report: AuditReport = {
      id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      auditTimestamp: new Date().toISOString(),
      originalText: text,
      sanitizedText,
      piiRedactedCount,
      piiItemsScrubbed,
      totalClaimsAudited: auditedClaims.length,
      overallScore: averageConfidence,
      overallVerdict,
      executiveSummary: `Due-diligence audit completed across ${auditedClaims.length} atomic propositions. Overall posture determined as ${overallVerdict} with ${averageConfidence}% empirical confidence under NIST/ISO cryptographic provenance standards.`,
      claims: auditedClaims,
      meta: {
        nebiusModel: process.env.NEBIUS_MODEL || "nvidia/Nemotron-3_5-Lightning",
        nebiusBaseUrl: process.env.NEBIUS_BASE_URL || "https://api.tokenfactory.nebius.com/v1",
        tavilySearchDepth: "advanced",
        forensicStandard: "FIPS PUB 180-4 SHA-256 UTC Proofs",
        processingTimeMs: Date.now() - startTime,
        airlockActive,
        strictGrounding,
      },
    };

    return NextResponse.json(report, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal audit engine failure";
    return NextResponse.json(
      {
        error: message,
        processingTimeMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
