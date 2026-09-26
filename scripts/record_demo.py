import asyncio
import os
import shutil
import subprocess
import edge_tts
import imageio_ffmpeg

DEMO_TEXT = """In enterprise due diligence, venture capital, and compliance, taking marketing assertions at face value leads to catastrophic multi-million dollar mistakes. 
Generative AI alone hallucinates and suffers from confirmation bias. Enterprises need verifiable, cryptographically immutable truth. 
Welcome to DeepAudit AI — the autonomous due-diligence and forensic fact-checking engine built for mission-critical audit pipelines. 

DeepAudit AI pairs the immense reasoning capabilities of NVIDIA Nemotron hosted on high-throughput Nebius Token Factory infrastructure with Tavily AI Search. 
Before any query touches the web, our zero-trust PII Data Airlock automatically scrubs sensitive emails, phone numbers, and entity IDs. 
Next, Nemotron deconstructs complex corporate prose into atomic propositions, generating dual search streams: one for confirmation, and one specifically targeted to uncover refutations and caveats. 

Watch the engine in action. We input NVIDIA's headline Blackwell claim. In parallel, Tavily queries multiple authoritative sources simultaneously. 
Every single web evidence excerpt is instantly frozen with a cryptographic SHA-256 hash and UTC timestamp, creating an auditable, tamper-proof evidentiary chain of custody. 
Nemotron then synthesizes the evidence, identifying that the 30x speedup requires specific FP4 quantization on rack-scale NVL72 architectures, rather than general FP16 workloads. 

The auditor receives an instant structured memo with calibrated confidence scores, actionable risk flags, and verified citations. 
With one click, download full JSON audit packages or formatted Markdown memos for board presentations. 
DeepAudit AI: turning enterprise skepticism into cryptographically verified certainty. Thank you."""

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
TEMP_VIDEO_DIR = os.path.join(BASE_DIR, "temp_video_rec")
AUDIO_FILE = os.path.join(PUBLIC_DIR, "voiceover.mp3")
OUTPUT_VIDEO = os.path.join(PUBLIC_DIR, "demo_walkthrough.mp4")

os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(TEMP_VIDEO_DIR, exist_ok=True)

async def generate_voiceover():
    print("Generating neural voiceover using edge-tts (en-US-ChristopherNeural)...")
    communicate = edge_tts.Communicate(DEMO_TEXT, "en-US-ChristopherNeural")
    await communicate.save(AUDIO_FILE)
    print(f"Voiceover saved: {AUDIO_FILE}")

async def record_screen():
    from playwright.async_api import async_playwright

    print("Launching Playwright video recorder (1920x1080)...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=TEMP_VIDEO_DIR,
            record_video_size={"width": 1920, "height": 1080},
        )
        page = await context.new_page()

        # Step 1: Open app
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Step 2: Hover system badges
        badges = page.locator("header div.flex-wrap")
        if await badges.count() > 0:
            await badges.hover()
            await page.wait_for_timeout(2000)

        # Step 3: Toggle PII airlock demonstration
        airlock_toggle = page.locator("button:has(span.rounded-full)")
        if await airlock_toggle.count() > 0:
            await airlock_toggle.first.click()
            await page.wait_for_timeout(1000)
            await airlock_toggle.first.click()
            await page.wait_for_timeout(1500)

        # Step 4: Click preset benchmark
        preset_btn = page.locator("button:has-text('NVIDIA Blackwell B200 Hardware Claim')")
        if await preset_btn.count() > 0:
            await preset_btn.click()
            await page.wait_for_timeout(1500)

        # Step 5: Click Initiate DeepAudit Pipeline
        audit_btn = page.locator("button:has-text('Initiate DeepAudit Pipeline')")
        await audit_btn.click()
        print("Audit initiated, recording execution stepper...")

        # Step 6: Watch stages resolve
        await page.wait_for_timeout(3000)
        try:
            await page.wait_for_selector("text=Executive Due-Diligence Summary", timeout=45000)
        except Exception:
            pass

        await page.wait_for_timeout(2500)

        # Step 7: Smooth scroll down to view summary and posture
        await page.evaluate("window.scrollBy({ top: 380, behavior: 'smooth' })")
        await page.wait_for_timeout(3500)

        # Step 8: Scroll down to evidence drawer
        target = page.locator("text=Cryptographically Frozen Web Evidence")
        if await target.count() > 0:
            await target.scroll_into_view_if_needed()
            await page.wait_for_timeout(3000)

        # Step 9: Copy SHA-256 hash button click
        copy_btn = page.locator("button[title='Copy SHA-256 Hash']")
        if await copy_btn.count() > 0:
            await copy_btn.first.click()
            await page.wait_for_timeout(2000)

        # Step 10: Scroll slightly up and hover export memo
        await page.evaluate("window.scrollBy({ top: -300, behavior: 'smooth' })")
        await page.wait_for_timeout(1500)

        memo_btn = page.locator("button:has-text('Export Audit Memo (MD)')")
        if await memo_btn.count() > 0:
            await memo_btn.hover()
            await page.wait_for_timeout(2000)

        # Final hold
        await page.wait_for_timeout(3000)

        await page.close()
        await context.close()
        await browser.close()
        print("Screen recording finished.")

def compile_final_video():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"Using ffmpeg at: {ffmpeg_exe}")

    # Find the recorded video in TEMP_VIDEO_DIR
    files = [os.path.join(TEMP_VIDEO_DIR, f) for f in os.listdir(TEMP_VIDEO_DIR) if f.endswith(".webm")]
    if not files:
        raise RuntimeError("No recorded video found in temp directory!")
    raw_video = files[0]
    print(f"Found recorded video: {raw_video}")

    # Merge video and voiceover
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", raw_video,
        "-i", AUDIO_FILE,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_VIDEO
    ]
    print(f"Running ffmpeg command: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)
    print(f"Final walkthrough video generated: {OUTPUT_VIDEO}")

    # Cleanup temp directory
    try:
        shutil.rmtree(TEMP_VIDEO_DIR)
    except Exception:
        pass

async def main():
    await generate_voiceover()
    await record_screen()
    compile_final_video()
    print("Demo video generation 100% complete!")

if __name__ == "__main__":
    asyncio.run(main())
