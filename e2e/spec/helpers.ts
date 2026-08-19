import type { Page } from "@playwright/test";

export interface PacketInput {
  name: string;
  description: string;
  category: string;
  condition: string;
  quantity: number;
}

export async function createPacketViaApi(
  page: Page,
  packet: PacketInput,
): Promise<number> {
  const response = await page.request.post("/api/packets", { data: packet });
  const body = (await response.json()) as { id: number };
  return body.id;
}

export async function claimPacketViaApi(
  page: Page,
  packetId: number,
  name: string,
): Promise<void> {
  await page.request.post(`/api/packets/${packetId}/claim`, {
    data: { name },
  });
}
