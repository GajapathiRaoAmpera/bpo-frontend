import { expect, type Page, test } from "@playwright/test";

const PASSWORD = process.env.E2E_PASSWORD ?? "";

const email = (name: string) => {
  const [first, ...rest] = name.toLowerCase().split(" ");
  return `${first}.${rest.join("")}@sandbox.assurevoice.in`;
};

async function signIn(page: Page, name: string) {
  // networkidle: filling before hydration loses the submit handler under parallel dev load.
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByLabel("Work email").fill(email(name));
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  // Wait for the session cookie before callers navigate away.
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.beforeAll(() => {
  if (!PASSWORD) throw new Error("Set E2E_PASSWORD to the backend SEED_PASSWORD");
});

test("team lead lands on the live monitor", async ({ page }) => {
  await signIn(page, "Karthik Subramanian");
  await expect(page).toHaveURL("/live-monitor");
  await expect(page.getByRole("heading", { name: "Live Monitor" })).toBeVisible();
  await expect(page.getByText("Active calls")).toBeVisible();
});

test("ops manager sees the live monitor as view only", async ({ page }) => {
  await signIn(page, "Anitha Raman");
  await page.goto("/live-monitor");
  await expect(page.getByText("View only for your role.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open call" })).toHaveCount(0);
});

test("compliance officer filters the audit log and exports CSV, which is itself audited", async ({ page }) => {
  await signIn(page, "Lakshmi Venkatesh");
  await page.goto("/audit");
  await page.getByLabel("Action").selectOption("login");
  await page.getByRole("button", { name: "Apply filters" }).click();
  const rows = page.locator("tbody tr");
  await expect(rows.first()).toContainText("Sign in");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  expect((await download).suggestedFilename()).toMatch(/\.csv$/);
  await expect(page.getByText("Audit log exported")).toBeVisible();
  await page.getByLabel("Action").selectOption("export");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(rows.first()).toContainText("Lakshmi Venkatesh");
});

test("super admin adds, deactivates and reactivates a user and sees the matrix", async ({ page }) => {
  const name = `Nila Ramesh ${Date.now() % 100000}`;
  await signIn(page, "Ravi Shankar");
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "Permission matrix" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Deactivate Ravi Shankar" })).toBeDisabled();

  await page.getByRole("button", { name: "Add user" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Work email").fill(`${name.toLowerCase().replaceAll(" ", ".")}@sandbox.assurevoice.in`);
  await dialog.getByLabel("Full name").fill(name);
  await dialog.getByLabel("Job title").fill("Service Executive");
  await dialog.getByLabel("Password").fill("Fresh@Pass9");
  await dialog.getByRole("button", { name: "Add user" }).click();
  await expect(page.getByText(`Added ${name}`)).toBeVisible();

  await page.getByRole("button", { name: `Deactivate ${name}` }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: /^Deactivate/ }).click();
  await expect(page.getByText(`${name} is deactivated`)).toBeVisible();
  await page.getByRole("button", { name: `Reactivate ${name}` }).click();
  await expect(page.getByText(`${name} can sign in again`)).toBeVisible();
});

test("super admin sees integrations with pilot labels", async ({ page }) => {
  await signIn(page, "Ravi Shankar");
  await page.goto("/admin/integrations");
  await expect(page.getByText("Google Gemini Live")).toBeVisible();
  await expect(page.getByText("Pilot integration").first()).toBeVisible();
});
