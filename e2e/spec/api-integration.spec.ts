import { test, expect } from "@playwright/test";
import { createPacketViaApi } from "./helpers.ts";

test.describe("API Integration Tests", () => {
  const packetData = {
    name: "Integration Test Tomato",
    description: "A packet for testing",
    category: "vegetable",
    condition: "new" as const,
    quantity: 25,
  };

  test("POST /api/packets creates a packet and returns 201", async ({ page }) => {
    const response = await page.request.post("/api/packets", { data: packetData });
    expect(response.status()).toBe(201);
    const body = (await response.json()) as { id: number; name: string };
    expect(body.name).toBe(packetData.name);
    expect(body.id).toBeGreaterThan(0);
  });

  test("GET /api/packets lists packets", async ({ page }) => {
    await createPacketViaApi(page, packetData);
    const response = await page.request.get("/api/packets");
    expect(response.status()).toBe(200);
    const body = (await response.json()) as Array<{ name: string }>;
    expect(body.length).toBeGreaterThan(0);
  });

  test("GET /api/packets/:id returns packet details", async ({ page }) => {
    const id = await createPacketViaApi(page, packetData);
    const response = await page.request.get(`/api/packets/${id}`);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { name: string; claimed_by: string | null };
    expect(body.name).toBe(packetData.name);
    expect(body.claimed_by).toBeNull();
  });

  test("GET /api/packets/:id returns 404 for non-existent id", async ({ page }) => {
    const response = await page.request.get("/api/packets/99999");
    expect(response.status()).toBe(404);
  });

  test("POST /api/packets with invalid data returns 400", async ({ page }) => {
    const response = await page.request.post("/api/packets", {
      data: { name: "", description: "", category: "", condition: "bad", quantity: -1 },
    });
    expect(response.status()).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  test("POST /api/packets/:id/claim claims a packet and returns 200", async ({ page }) => {
    const id = await createPacketViaApi(page, packetData);
    const response = await page.request.post(`/api/packets/${id}/claim`, {
      data: { name: "Jane Doe" },
    });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { claimed_by: string };
    expect(body.claimed_by).toBe("Jane Doe");
  });

  test("POST /api/packets/:id/claim returns 409 when already claimed", async ({ page }) => {
    const id = await createPacketViaApi(page, packetData);
    await page.request.post(`/api/packets/${id}/claim`, {
      data: { name: "First" },
    });
    const response = await page.request.post(`/api/packets/${id}/claim`, {
      data: { name: "Second" },
    });
    expect(response.status()).toBe(409);
    const body = (await response.json()) as { error: string };
    expect(body.error).toMatch(/already claimed/i);
  });
});
