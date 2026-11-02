import { expect, type Page, test } from "@playwright/test";

const PASSWORD = process.env.E2E_PASSWORD ?? "";

// Expected from docs/PRD.md access matrix (the test oracle; the app reads it from the API).
const PERSONAS = [
  { name: "Ravi Shankar", role: "Super Admin", landing: "/dashboard",
    menu: ["Executive Dashboard", "Call History", "Audit Log", "Users & Roles", "Integrations"] },
  { name: "Anitha Raman", role: "Operations Manager", landing: "/dashboard",
    menu: ["Executive Dashboard", "Live Monitor", "Escalation Queue", "Call History", "Customers & Policies",
      "Follow-ups", "Campaigns", "Approvals", "QA Review"] },
  { name: "Karthik Subramanian", role: "Team Lead", landing: "/live-monitor",
    menu: ["Executive Dashboard", "Agent Console", "Live Monitor", "Escalation Queue", "Call History",
      "Customers & Policies", "Follow-ups", "QA Review"] },
  { name: "Divya Krishnan", role: "Human Agent", landing: "/agent-console",
    menu: ["Agent Console", "Escalation Queue", "Call History", "Customers & Policies", "Follow-ups"] },
  { name: "Suresh Babu", role: "Campaign Manager", landing: "/campaigns",
    menu: ["Executive Dashboard", "Call History", "Customers & Policies", "Follow-ups", "Campaigns"] },
  { name: "Meera Iyer", role: "Bot Designer", landing: "/bot-studio", menu: ["Call History", "Bot Studio"] },
  { name: "Prakash Natarajan", role: "QA Analyst", landing: "/qa",
    menu: ["Executive Dashboard", "Call History", "Customers & Policies", "QA Review"] },
  { name: "Lakshmi Venkatesh", role: "Compliance Officer", landing: "/approvals",
    menu: ["Executive Dashboard", "Call History", "Customers & Policies", "Campaigns", "Bot Studio",
      "Approvals", "QA Review", "Audit Log"] },
];

const email = (name: string) => {
  const [first, ...rest] = name.toLowerCase().split(" ");
  return `${first}.${rest.join("")}@sandbox.amperabpo.in`;
};

async function signIn(page: Page, name: string) {
  // networkidle: filling before hydration loses the submit handler under parallel dev load.
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByLabel("Work email").fill(email(name));
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test.beforeAll(() => {
  if (!PASSWORD) throw new Error("Set E2E_PASSWORD to the backend SEED_PASSWORD");
});

for (const p of PERSONAS) {
  test(`${p.role} lands on ${p.landing} with exactly its menu`, async ({ page }) => {
    await signIn(page, p.name);
    await expect(page).toHaveURL(p.landing);
    await expect(page.getByText("Sandbox environment · synthetic data")).toBeVisible();
    await expect(page.getByRole("button", { name: `Account menu for ${p.name}` })).toContainText(p.role);
    const links = page.getByRole("complementary").getByRole("link");
    await expect(links).toHaveText(p.menu);
  });
}

test("anonymous users are sent to sign-in and returned after", async ({ page }) => {
  await page.goto("/customers");
  await expect(page).toHaveURL(/\/login\?next=%2Fcustomers/);
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Work email").fill(email("Divya Krishnan"));
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/customers");
});

test("wrong password shows an inline error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Work email").fill(email("Anitha Raman"));
  await page.getByLabel("Password", { exact: true }).fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "incorrect" })).toHaveText("Email or password is incorrect");
});

test("a screen outside the role shows No access", async ({ page }) => {
  await signIn(page, "Meera Iyer");
  await expect(page).toHaveURL("/bot-studio");
  await page.goto("/audit");
  await expect(page.getByText("This area isn't part of your role")).toBeVisible();
  await page.getByRole("link", { name: "Go to Bot Studio" }).click();
  await expect(page).toHaveURL("/bot-studio");
});

test("sign out ends the session", async ({ page }) => {
  await signIn(page, "Ravi Shankar");
  await page.getByRole("button", { name: "Account menu for Ravi Shankar" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/login");
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
