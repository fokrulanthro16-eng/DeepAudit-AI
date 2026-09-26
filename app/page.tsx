"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Search,
  Hash,
  Lock,
  Unlock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  ArrowRight,
} from "lucide-react";
import { AuditReport, ClaimAudit, PipelineStage, Verdict } from "@/lib/types";

const PRESET_SCENARIOS = [
  {
    title: "NVIDIA Blackwell B200 Hardware Claim",
    subtitle: "AI Infrastructure Due-Diligence",
    text: "The NVIDIA Blackwell B200 GPU delivers up to 30x faster inference performance and reduces energy consumption by 25x compared to H100. Contact our procurement desk at enterprise-sales@nvidia-partner.com or call +1 (555) 438-9021 for server rack delivery.",
  },
  {
    title: "Fintech Core Banking SLA & 10x ROI",
    subtitle: "Financial Venture Capital Audit",
    text: "Our core payment rail guarantees 99.999% zero-downtime SLA across all multi-cloud nodes, delivering an audited 10x ROI within 12 months for institutional banking partners. Verified by tax ID 12-3456789.",
  },
  {
    title: "Room-Temperature Superconductor Claim",
    subtitle: "DeepTech Materials Science",
    text: "The newly synthesized modified lead-apatite compound LK-99 exhibits zero electrical resistance and strong Meissner levitation at ambient temperature and standard atmospheric pressure.",
  },
  {
    title: "Autonomous Medical AI Zero-Error",
    subtitle: "Healthcare Regulatory Review",
    text: "MediGen-X diagnostic AI achieved a 100% zero-false-positive rate in clinical oncology trials, completely eliminating human radiologist intervention across 50,000 patient mammograms.",
  },
];

const INITIAL_STAGES: PipelineStage[] = [
  { id: 1, name: "PII Sanitized", description: "Regex airlock scrubs emails, phones, SSNs", status: "idle" },
  { id: 2, name: "Claims Deconstructed", description: "Nemotron extracts discrete atomic claims", status: "idle" },
  { id: 3, name: "Parallel Tavily Searches", description: "Dual confirmation & refutation queries", status: "idle" },
  { id: 4, name: "SHA-256 Hashes Frozen", description: "Evidence stamped with cryptographic hash & UTC", status: "idle" },
  { id: 5, name: "Nemotron Deep Synthesis", description: "Forensic reasoning, scoring & verdict", status: "idle" },
];

export default function DeepAuditDashboard() {
  const [inputText, setInputText] = useState(PRESET_SCENARIOS[0].text);
  const [airlockActive, setAirlockActive] = useState(true);
  const [strictGrounding, setStrictGrounding] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [expandedClaims, setExpandedClaims] = useState<Record<string, boolean>>({});
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set first claim expanded by default when report arrives
  useEffect(() => {
    if (report && report.claims.length > 0) {
      setExpandedClaims({ [report.claims[0].claimId]: true });
    }
  }, [report]);

  const toggleClaimExpansion = (claimId: string) => {
    setExpandedClaims((prev) => ({
      ...prev,
      [claimId]: !prev[claimId],
    }));
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const runAudit = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);

    // Progressive stage animation
    setStages([
      { ...INITIAL_STAGES[0], status: "running" },
      { ...INITIAL_STAGES[1], status: "idle" },
      { ...INITIAL_STAGES[2], status: "idle" },
      { ...INITIAL_STAGES[3], status: "idle" },
      { ...INITIAL_STAGES[4], status: "idle" },
    ]);

    const timer1 = setTimeout(() => {
      setStages((prev) => [
        { ...prev[0], status: "completed" },
        { ...prev[1], status: "running" },
        prev[2],
        prev[3],
        prev[4],
      ]);
    }, 600);

    const timer2 = setTimeout(() => {
      setStages((prev) => [
        prev[0],
        { ...prev[1], status: "completed" },
        { ...prev[2], status: "running" },
        prev[3],
        prev[4],
      ]);
    }, 1200);

    const timer3 = setTimeout(() => {
      setStages((prev) => [
        prev[0],
        prev[1],
        { ...prev[2], status: "completed" },
        { ...prev[3], status: "running" },
        prev[4],
      ]);
    }, 1900);

    const timer4 = setTimeout(() => {
      setStages((prev) => [
        prev[0],
        prev[1],
        prev[2],
        { ...prev[3], status: "completed" },
        { ...prev[4], status: "running" },
      ]);
    }, 2600);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          airlockActive,
          strictGrounding,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Audit failed to execute");
      }

      const auditData: AuditReport = await res.json();
      setReport(auditData);

      setStages([
        { ...INITIAL_STAGES[0], status: "completed" },
        { ...INITIAL_STAGES[1], status: "completed" },
        { ...INITIAL_STAGES[2], status: "completed" },
        { ...INITIAL_STAGES[3], status: "completed" },
        { ...INITIAL_STAGES[4], status: "completed" },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Audit request failed";
      setError(msg);
      setStages((prev) =>
        prev.map((s) => (s.status === "running" ? { ...s, status: "error" } : s))
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadJsonReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DeepAudit-Report-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMarkdownMemo = () => {
    if (!report) return;
    const md = `# DEEPAUDIT AI - FORENSIC DUE-DILIGENCE MEMO
**Report ID**: ${report.id}  
**Audit Timestamp (UTC)**: ${report.auditTimestamp}  
**Overall Posture**: ${report.overallVerdict} (Confidence: ${report.overallScore}%)  
**PII Scrubbed**: ${report.piiRedactedCount} items redacted  

## Executive Summary
${report.executiveSummary}

## Audited Claims Breakdown
${report.claims
  .map(
    (c, i) => `### Claim ${i + 1}: ${c.atomicClaim}
- **Verdict**: ${c.verdict}
- **Confidence**: ${c.confidenceScore}%
- **Executive Summary**: ${c.executiveSummary}
- **Findings**:
${c.auditFindings.map((f) => `  * ${f}`).join("\n")}
- **Risk Flags**: ${c.riskFlags.join(", ") || "None"}
- **Frozen Evidence (${c.evidence.length} sources)**:
${c.evidence
  .map(
    (e) =>
      `  * [${e.title}](${e.url}) - SHA-256: \`${e.sha256Hash}\` (Frozen: ${e.frozenAtUtc})`
  )
  .join("\n")}
`
  )
  .join("\n---\n")}

## Provenance Specification
- **LLM Backbone**: ${report.meta.nebiusModel} via Nebius Token Factory
- **Search Engine**: Tavily AI Search (Depth: ${report.meta.tavilySearchDepth})
- **Integrity Standard**: ${report.meta.forensicStandard}
`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DeepAudit-Memo-${report.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getVerdictBadge = (verdict: Verdict) => {
    switch (verdict) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-900/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            VERIFIED
          </span>
        );
      case "CONTRADICTORY":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-900/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            CONTRADICTORY
          </span>
        );
      case "DEBUNKED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-900/40">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            DEBUNKED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            INCONCLUSIVE
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 cyber-grid pb-20">
      {/* Top Hackathon Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border-b border-emerald-500/20 px-4 py-2 text-xs font-medium flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-semibold tracking-wide">
            NEBIUS x NVIDIA HACKATHON 2026
          </span>
          <span className="text-slate-500">•</span>
          <span>Best Apps and Agents Track + $3,000 Tavily Bonus</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
          <span>Enterprise Due-Diligence Engine</span>
          <span className="font-mono text-emerald-400">v1.0.0-PROD</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  DeepAudit<span className="text-emerald-400">AI</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Forensic
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous Due-Diligence & Cryptographic Fact-Checking Engine
              </p>
            </div>
          </div>

          {/* System Status Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">Nebius:</span>
              <span className="font-mono text-emerald-300 font-medium">Token Factory</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-slate-300">Model:</span>
              <span className="font-mono text-cyan-300 font-medium">NVIDIA Nemotron</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">Tavily:</span>
              <span className="font-mono text-amber-300 font-medium">Advanced Depth</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <Hash className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-300">Hash:</span>
              <span className="font-mono text-purple-300 font-medium">SHA-256 UTC</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Sidebar Controls & Preset Selector */}
          <div className="lg:col-span-4 space-y-6">
            {/* Enterprise Airlock & Grounding Controls */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                    Airlock & Security Controls
                  </h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ISO-27001
                </span>
              </div>

              <div className="space-y-4">
                {/* PII Airlock Toggle */}
                <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      {airlockActive ? (
                        <Lock className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Unlock className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="text-sm font-medium text-slate-200">
                        PII Data Airlock
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Redacts emails, phone numbers, and financial entity IDs before external search.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAirlockActive(!airlockActive)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      airlockActive ? "bg-emerald-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        airlockActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Strict Grounding Toggle */}
                <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-slate-200">
                        Strict Grounding Mode
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Flags ungrounded marketing assertions as contradictory or debunked.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStrictGrounding(!strictGrounding)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      strictGrounding ? "bg-cyan-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        strictGrounding ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Pre-loaded Benchmark Scenarios */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                    Audit Benchmark Scenarios
                  </h2>
                </div>
                <span className="text-[10px] text-slate-400">Click to load</span>
              </div>

              <div className="space-y-2.5">
                {PRESET_SCENARIOS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(preset.text)}
                    className="w-full text-left p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/60 hover:border-emerald-500/40 transition group"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                      <span>{preset.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {preset.subtitle}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Architecture Highlights Pill */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                DeepAudit Dual-Tier Defense
              </span>
              <p className="text-slate-400 leading-relaxed">
                Combines <strong className="text-slate-200">NVIDIA Nemotron</strong> for claim deconstruction & synthesis with <strong className="text-slate-200">Tavily Search</strong> for real-time web verification and cryptographic <strong className="text-slate-200">SHA-256</strong> evidentiary provenance.
              </p>
            </div>
          </div>

          {/* Right Column: Input, Pipeline Status & Audit Report */}
          <div className="lg:col-span-8 space-y-6">
            {/* Input Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Due-Diligence Audit Target
                </label>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{inputText.length} characters</span>
                  <button
                    onClick={() => setInputText("")}
                    className="hover:text-slate-200 underline text-slate-500 text-xs ml-2"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste corporate press releases, earnings transcript claims, investor pitch deck assertions, or hardware specs..."
                  className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/80 transition resize-none font-mono"
                />

                {airlockActive && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Airlock Active: Any emails, phones, or tax IDs in text will be scrubbed before external retrieval.</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Powered by <span className="text-emerald-400 font-mono">NVIDIA Nemotron-3.5</span> via Nebius Token Factory
                </div>

                <button
                  type="button"
                  onClick={runAudit}
                  disabled={loading || !inputText.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Auditing Claims...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Initiate DeepAudit Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Execution Pipeline Stepper */}
            {(loading || stages.some((s) => s.status !== "idle")) && (
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Forensic Pipeline Execution Status
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {stages.map((stage) => {
                    let borderClass = "border-slate-800 bg-slate-950/60 text-slate-400";
                    let icon = <span className="text-xs font-mono">{stage.id}</span>;

                    if (stage.status === "running") {
                      borderClass = "border-cyan-500/60 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-500/40";
                      icon = <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />;
                    } else if (stage.status === "completed") {
                      borderClass = "border-emerald-500/60 bg-emerald-950/40 text-emerald-300";
                      icon = <Check className="w-3.5 h-3.5 text-emerald-400" />;
                    } else if (stage.status === "error") {
                      borderClass = "border-rose-500/60 bg-rose-950/40 text-rose-300";
                      icon = <XCircle className="w-3.5 h-3.5 text-rose-400" />;
                    }

                    return (
                      <div
                        key={stage.id}
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all duration-300 ${borderClass}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700 text-[10px] font-mono">
                            {icon}
                          </span>
                          <span className="text-[10px] uppercase font-mono font-medium">
                            {stage.status}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-semibold line-clamp-1">{stage.name}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                            {stage.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-sm flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Audit Execution Error</div>
                  <div className="text-xs text-rose-300 mt-0.5">{error}</div>
                </div>
              </div>
            )}

            {/* Audit Results Section */}
            {report && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Executive Summary Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400">REPORT ID: {report.id}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-mono text-slate-400">{report.auditTimestamp}</span>
                      </div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        Executive Due-Diligence Summary
                      </h2>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Overall Verdict */}
                      <div className="text-right">
                        <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Overall Posture</div>
                        {getVerdictBadge(report.overallVerdict)}
                      </div>

                      {/* Overall Confidence Meter */}
                      <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
                        <div className="text-right">
                          <div className="text-[10px] font-mono uppercase text-slate-400">Confidence</div>
                          <div className="text-xl font-bold font-mono text-emerald-400">
                            {report.overallScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Text */}
                  <div className="mt-4 text-sm text-slate-300 leading-relaxed">
                    {report.executiveSummary}
                  </div>

                  {/* Redacted Items Pill if PII was scrubbed */}
                  {report.piiRedactedCount > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>
                          <strong className="text-emerald-400">{report.piiRedactedCount}</strong> sensitive identifier(s) neutralized via PII airlock before web retrieval.
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {report.piiItemsScrubbed.join(", ")}
                      </div>
                    </div>
                  )}

                  {/* Action Toolbar: Download JSON / Markdown */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
                      <span>{report.totalClaimsAudited} Claims Deconstructed</span>
                      <span>•</span>
                      <span>SHA-256 Provenance Locked</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={downloadJsonReport}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-300" />
                        Download Report (JSON)
                      </button>

                      <button
                        onClick={exportMarkdownMemo}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        Export Audit Memo (MD)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Individual Claims Breakdown Grid */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Deconstructed Claims & Evidentiary Verifications
                  </h3>

                  {report.claims.map((claim, idx) => {
                    const isExpanded = !!expandedClaims[claim.claimId];

                    return (
                      <div
                        key={claim.claimId}
                        className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden transition-all duration-200"
                      >
                        {/* Claim Header Bar */}
                        <div
                          onClick={() => toggleClaimExpansion(claim.claimId)}
                          className="p-5 cursor-pointer hover:bg-slate-850 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 max-w-2xl">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                CLAIM #{idx + 1}
                              </span>
                              {getVerdictBadge(claim.verdict)}
                              <span className="text-xs font-mono text-slate-400">
                                Confidence: {claim.confidenceScore}%
                              </span>
                            </div>
                            <h4 className="text-base font-semibold text-slate-100">
                              &ldquo;{claim.atomicClaim}&rdquo;
                            </h4>
                          </div>

                          <div className="flex items-center gap-3 self-end md:self-center">
                            {/* Radial/ProgressBar mini indicator */}
                            <div className="text-right hidden sm:block">
                              <div className="text-[10px] font-mono text-slate-400">EVIDENCE</div>
                              <div className="text-xs font-mono text-cyan-400 font-semibold">
                                {claim.evidence.length} Sources
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Claim Body */}
                        {isExpanded && (
                          <div className="p-5 border-t border-slate-800/80 bg-slate-950/40 space-y-5">
                            {/* Executive Claim Summary */}
                            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 leading-relaxed">
                              <div className="text-xs font-mono uppercase text-emerald-400 mb-1 font-semibold">
                                Forensic Verdict Analysis
                              </div>
                              {claim.executiveSummary}
                            </div>

                            {/* Dual Search Queries (Confirmation vs Refutation) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                                <div className="text-[10px] font-semibold uppercase text-emerald-400 mb-1 flex items-center gap-1.5">
                                  <Search className="w-3 h-3" /> Confirmation Query
                                </div>
                                <div className="text-slate-300 break-words">{claim.confirmationQuery}</div>
                              </div>

                              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20">
                                <div className="text-[10px] font-semibold uppercase text-rose-400 mb-1 flex items-center gap-1.5">
                                  <Search className="w-3 h-3" /> Refutation Query
                                </div>
                                <div className="text-slate-300 break-words">{claim.refutationQuery}</div>
                              </div>
                            </div>

                            {/* Audit Findings */}
                            {claim.auditFindings.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                  Key Evidentiary Findings
                                </h5>
                                <ul className="space-y-1.5">
                                  {claim.auditFindings.map((finding, fIdx) => (
                                    <li
                                      key={fIdx}
                                      className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                                      <span>{finding}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Risk Flags */}
                            {claim.riskFlags.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                  Enterprise Compliance & Risk Flags
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {claim.riskFlags.map((risk, rIdx) => (
                                    <span
                                      key={rIdx}
                                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/40 text-amber-300 border border-amber-500/30"
                                    >
                                      {risk}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Collapsible Forensic Evidence Drawer */}
                            <div className="pt-3 border-t border-slate-800">
                              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5 text-purple-400" />
                                Cryptographically Frozen Web Evidence (SHA-256)
                              </h5>

                              <div className="space-y-3">
                                {claim.evidence.map((ev) => (
                                  <div
                                    key={ev.id}
                                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs space-y-2"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                                            ev.queryType === "confirmation"
                                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                                              : "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                                          }`}
                                        >
                                          {ev.queryType}
                                        </span>
                                        <a
                                          href={ev.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="font-semibold text-slate-200 hover:text-emerald-400 transition flex items-center gap-1"
                                        >
                                          {ev.title}
                                          <ExternalLink className="w-3 h-3 text-slate-400" />
                                        </a>
                                      </div>

                                      <span className="text-[11px] font-mono text-slate-500">
                                        UTC: {ev.frozenAtUtc}
                                      </span>
                                    </div>

                                    <p className="text-slate-300 text-xs leading-relaxed italic bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                                      &ldquo;{ev.content}&rdquo;
                                    </p>

                                    {/* SHA-256 Hash display with copy button */}
                                    <div className="flex items-center justify-between gap-2 bg-purple-950/20 border border-purple-500/20 p-2 rounded-lg text-[11px] font-mono text-purple-300">
                                      <div className="flex items-center gap-2 truncate">
                                        <Hash className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                        <span className="truncate">SHA-256: {ev.sha256Hash}</span>
                                      </div>
                                      <button
                                        onClick={() => handleCopyHash(ev.sha256Hash)}
                                        className="hover:text-white flex-shrink-0 p-1 rounded hover:bg-purple-900/40 transition"
                                        title="Copy SHA-256 Hash"
                                      >
                                        {copiedHash === ev.sha256Hash ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5 text-purple-400" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
