# Contributing to DeepAudit AI

Thank you for your interest in contributing to **DeepAudit AI**! This project was built for the **Nebius x NVIDIA Global AI Hackathon (Best Apps and Agents Track + $3,000 Tavily Bonus)**.

## Architectural Guidelines
1. **PII Data Airlock**: Never dispatch unscrubbed entity data (emails, phone numbers, tax IDs) to external search providers.
2. **Dual-Tier Reasoning**: Always formulate paired `confirmationQuery` and `refutationQuery` to combat confirmation bias.
3. **Forensic Integrity**: All external evidentiary snippets must be hashed using SHA-256 and stamped with UTC timestamps before feeding into reasoning models.

## Development Workflow
1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env.local
   ```
4. Run locally:
   ```bash
   npm run dev
   ```
5. Ensure zero TypeScript or build errors:
   ```bash
   npm run build
   ```
