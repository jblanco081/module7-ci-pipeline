import { test, expect } from "@playwright/test";
import { createPacketViaApi } from "./helpers.ts";

test.describe("Example: Packet CRUD Workflow", () => {
  test("create, edit, and delete a packet via the admin page", async ({ page }) => {
    // Navigate to the Packets admin page
    await page.goto("/packets");

    // Open the "Add Packet" form and fill it in
    const packetName = `CRUD Test ${Date.now()}`;
    await page.getByRole("button", { name: /add packet/i }).click();
    await page.getByLabel("Name").fill(packetName);
    await page.getByLabel("Description").fill("A test seed packet");
    await page.getByLabel("Category").selectOption("herb");
    await page.getByLabel("Condition").selectOption("new");
    await page.getByLabel("Quantity").fill("20");
    await page.getByRole("button", { name: /save/i }).click();

    // Verify the packet appears in the table
    const row = page.getByRole("row").filter({ hasText: packetName });
    await expect(row).toBeVisible();
    await expect(row).toContainText("20");

    // Edit the packet name
    await row.getByRole("button", { name: /edit/i }).click();
    await page.getByLabel("Name").fill(`${packetName} (edited)`);
    await page.getByRole("button", { name: /save/i }).click();

    // Verify the updated name appears
    const updatedRow = page.getByRole("row").filter({
      hasText: `${packetName} (edited)`,
    });
    await expect(updatedRow).toBeVisible();

    // Delete the packet and verify it's gone
    await updatedRow.getByRole("button", { name: /delete/i }).click();
    await expect(updatedRow).not.toBeVisible();
  });
});

test.describe("Claim Flow E2E", () => {
  test("full claim workflow: browse, select, claim, see confirmation", async ({ page }) => {
    const packetName = `E2E Packet ${Date.now()}`;
    await createPacketViaApi(page, {
      name: packetName,
      description: "End-to-end test packet",
      category: "vegetable",
      condition: "new",
      quantity: 10,
    });

    // Navigate to Claim page
    await page.goto("/claim");

    // See the packet listed
    const packetCard = page.getByRole("article").filter({ hasText: packetName });
    await expect(packetCard).toBeVisible();
    await expect(packetCard).toContainText("10");

    // Click to select it
    await packetCard.getByRole("button", { name: /claim/i }).click();

    // Fill claim form
    await page.getByLabel("Your Name").fill("Test User");
    await page.getByRole("button", { name: /^claim$/i }).click();

    // See confirmation
    const confirmation = page.getByRole("status");
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toContainText(packetName);

    // Navigate back and verify the packet is gone from available list
    await page.getByRole("button", { name: /back|browse/i }).click();
    const claimedCard = page.getByRole("article").filter({ hasText: packetName });
    await expect(claimedCard).not.toBeVisible();
  });
});
