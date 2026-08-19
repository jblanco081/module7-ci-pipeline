import type { SeedPacket, SeedPacketSummary } from "./types.ts";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ─── Packets ─────────────────────────────────────────────────────────────────

export const packets = {
  list: (params?: { category?: string; claimed?: boolean }): Promise<SeedPacketSummary[]> => {
    const search = new URLSearchParams();
    if (params?.category) search.set("category", params.category);
    if (params?.claimed !== undefined) search.set("claimed", String(params.claimed));
    const qs = search.toString();
    return request<SeedPacketSummary[]>(`/api/packets${qs ? `?${qs}` : ""}`);
  },

  get: (id: number): Promise<SeedPacket> =>
    request<SeedPacket>(`/api/packets/${id}`),

  create: (data: {
    name: string;
    description: string;
    category: string;
    condition: string;
    quantity: number;
  }): Promise<SeedPacket> =>
    request<SeedPacket>("/api/packets", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number,
    data: {
      name: string;
      description: string;
      category: string;
      condition: string;
      quantity: number;
    },
  ): Promise<SeedPacket> =>
    request<SeedPacket>(`/api/packets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<void> =>
    request<void>(`/api/packets/${id}`, { method: "DELETE" }),

  claim: (id: number, data: { name: string }): Promise<SeedPacket> =>
    request<SeedPacket>(`/api/packets/${id}/claim`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
