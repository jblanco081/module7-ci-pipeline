import { test, expect } from "@playwright/test";
import { createPacketViaApi } from "./helpers.ts";

test.describe("Stress Test — Concurrent Claims", () => {
  test("exactly 1 claim succeeds for a single packet", async ({ page }) => {
    const packetId = await createPacketViaApi(page, {
      name: `Stress Test Packet ${Date.now()}`,
      description: "Stress test for concurrent claims",
      category: "herb",
      condition: "new",
      quantity: 50,
    });

    // Send 10 concurrent claim requests for the same packet
    const totalRequests = 10;
    const promises = Array.from({ length: totalRequests }, (_, i) =>
      page.request.post(`/api/packets/${packetId}/claim`, {
        data: { name: `User ${i}` },
      }),
    );

    const responses = await Promise.all(promises);
    const statuses = responses.map((r) => r.status());

    const successes = statuses.filter((s) => s === 200).length;
    const conflicts = statuses.filter((s) => s === 409).length;

    // Exactly 1 should succeed (a packet can only be claimed once)
    expect(successes).toBe(1);
    // The rest should be 409 (already claimed)
    expect(conflicts).toBe(totalRequests - 1);

    // Verify via API that packet is claimed
    const detailResponse = await page.request.get(`/api/packets/${packetId}`);
    const details = (await detailResponse.json()) as { claimed_by: string };
    expect(details.claimed_by).toBeTruthy();
  });
});
