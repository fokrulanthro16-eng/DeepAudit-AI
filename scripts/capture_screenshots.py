import asyncio
import os
from playwright.async_api import async_playwright

DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "screenshots"))
os.makedirs(DOCS_DIR, exist_ok=True)

async def capture():
    print(f"Saving screenshots to {DOCS_DIR}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()

        print("Navigating to http://localhost:3000...")
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(1500)

        # 1. Hero Dashboard
        shot1 = os.path.join(DOCS_DIR, "01_hero_dashboard.png")
        await page.screenshot(path=shot1, full_page=False)
        print(f"Saved: {shot1}")

        # 2. PII Airlock & Controls
        shot2 = os.path.join(DOCS_DIR, "02_pii_airlock_active.png")
        await page.screenshot(path=shot2, full_page=False)
        print(f"Saved: {shot2}")

        # 3. Trigger audit to capture pipeline in action
        print("Clicking Initiate DeepAudit Pipeline...")
        audit_button = page.locator("button:has-text('Initiate DeepAudit Pipeline')")
        await audit_button.click()
        await page.wait_for_timeout(1000)

        shot3 = os.path.join(DOCS_DIR, "03_live_execution_pipeline.png")
        await page.screenshot(path=shot3, full_page=False)
        print(f"Saved: {shot3}")

        # Wait for audit results to arrive
        print("Waiting for audit completion...")
        await page.wait_for_selector("text=Executive Due-Diligence Summary", timeout=45000)
        await page.wait_for_timeout(2000)

        # 4. Claim Audit Results
        shot4 = os.path.join(DOCS_DIR, "04_claim_audit_results.png")
        await page.screenshot(path=shot4, full_page=False)
        print(f"Saved: {shot4}")

        # Scroll down slightly to show forensic evidence drawer
        await page.evaluate("window.scrollBy(0, 480)")
        await page.wait_for_timeout(1000)

        # 5. Forensic Evidence Drawer with SHA-256 Hashes
        shot5 = os.path.join(DOCS_DIR, "05_forensic_evidence_drawer.png")
        await page.screenshot(path=shot5, full_page=False)
        print(f"Saved: {shot5}")

        await browser.close()
        print("All 5 screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(capture())
