import crypto from "crypto";

/**
 * Computes a SHA-256 cryptographic hash for a given string or buffer.
 * Used for forensic immutable verification of web excerpts and audit records.
 */
export function computeSha256(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

/**
 * Creates a forensic snapshot stamp with SHA-256 and UTC ISO-8601 timestamp.
 */
export function createForensicSnapshot(content: string, url: string) {
  const payload = `${url}::${content.trim()}`;
  const sha256Hash = computeSha256(payload);
  const frozenAtUtc = new Date().toISOString();

  return {
    sha256Hash,
    frozenAtUtc,
    tamperProofProofKey: `SEC-SHA256:${sha256Hash.slice(0, 16)}...${sha256Hash.slice(-8)}`,
  };
}
