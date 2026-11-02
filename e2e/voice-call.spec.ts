import { type chromium, expect, type Page, test } from "@playwright/test";

// Opt-in: real Gemini Live calls. Generate the customer audio first:
//   (bpo-backend) poetry run python -m scripts.make_test_audio /tmp/av-audio
//   E2E_VOICE_DIR=/tmp/av-audio E2E_PASSWORD=... npx playwright test voice-call
const DIR = process.env.E2E_VOICE_DIR;
const PASSWORD = process.env.E2E_PASSWORD ?? "";

test.describe("voice agent (live Gemini)", () => {
  test.skip(!DIR, "set E2E_VOICE_DIR to run live voice calls");
  test.describe.configure({ mode: "serial", timeout: 300_000 });

  async function startCall(playwright: { chromium: typeof chromium }, wav: string) {
    const browser = await playwright.chromium.launch({ args: [
      "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream",
      `--use-file-for-fake-audio-capture=${DIR}/${wav}`, "--autoplay-policy=no-user-gesture-required"] });
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ["microphone"] })).newPage();
    await page.goto("http://localhost:3000/login");
    await page.getByLabel("Work email").fill("divya.krishnan@sandbox.amperabpo.in");
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/agent-console");
    // Wait for queue items (named by policy number), not the action buttons below them.
    await page.getByRole("button", { name: /(MOT|HLT|TRM)-2026-/ }).first().click();
    await page.getByRole("button", { name: "Start renewal call" }).click();
    await expect(page.getByText("AI on call").first()).toBeVisible({ timeout: 30_000 });
    return { browser, page };
  }

  const timeline = (page: Page) => page.locator("section:has(h2:text('AI actions'))");
  const summary = (page: Page) => page.locator("section:has(h2:text('Call summary'))");

  test("renewal call ends with a payment link and a scored summary", async ({ playwright }) => {
    const { browser, page } = await startCall(playwright, "payment.wav");
    await expect(timeline(page)).toContainText("Customer verified", { timeout: 90_000 });
    await expect(timeline(page)).toContainText("Payment link sent on WhatsApp", { timeout: 90_000 });
    await page.waitForTimeout(12_000); // let the bot close the call
    await page.getByRole("button", { name: "End call" }).click();
    await expect(summary(page)).toContainText("Payment link sent", { timeout: 150_000 });
    await expect(summary(page)).toContainText(/\/ 5|QA not scored/, { timeout: 150_000 });
    await browser.close();
  });

  test("escalation is taken over by the human agent", async ({ playwright }) => {
    const { browser, page } = await startCall(playwright, "escalate.wav");
    await expect(page.getByText("The AI asked for a human agent")).toBeVisible({ timeout: 120_000 });
    await page.getByRole("button", { name: "Take over now" }).click();
    await expect(page.getByText("You are on the call")).toBeVisible();
    await page.getByText("Escalated", { exact: true }).click();
    await page.getByLabel("Note for the record").fill("Late fee dispute logged with billing.");
    await page.getByRole("button", { name: "End call" }).click();
    await expect(summary(page)).toContainText("Escalated", { timeout: 150_000 });
    await browser.close();
  });
});
