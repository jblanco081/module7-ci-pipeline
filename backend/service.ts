import type { DB } from "./db.ts";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SeedPacket {
  id: number;
  name: string;
  description: string;
  category: string;
  condition: string;
  quantity: number;
  claimed_by: string | null;
}

export interface SeedPacketSummary {
  id: number;
  name: string;
  category: string;
  condition: string;
  quantity: number;
  claimed_by: string | null;
}

// ─── Packets ─────────────────────────────────────────────────────────────────

export async function createPacket(
  db: DB,
  data: { name: string; description: string; category: string; condition: string; quantity: number },
): Promise<SeedPacket> {
 // if (!data.name.trim()) throw new Error("Name is required");
  if (data.quantity <= 0) throw new Error("Quantity must be a positive number");

  const result = await db
    .insertInto("seed_packets")
    .values({
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      condition: data.condition,
      quantity: data.quantity,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return result;
}

export async function getPacket(db: DB, id: number): Promise<SeedPacket | null> {
  const packet = await db
    .selectFrom("seed_packets")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  if (!packet) return null;
  return packet;
}

export async function listPackets(
  db: DB,
  filters?: { category?: string; claimed?: boolean },
): Promise<SeedPacketSummary[]> {
  let query = db
    .selectFrom("seed_packets")
    .select(["id", "name", "category", "condition", "quantity", "claimed_by"])
    .orderBy("name");

  if (filters?.category) {
    query = query.where("category", "=", filters.category);
  }

  if (filters?.claimed === true) {
    query = query.where("claimed_by", "is not", null);
  } else if (filters?.claimed === false) {
    query = query.where("claimed_by", "is", null);
  }

  const rows = await query.execute();
  return rows;
}

export async function updatePacket(
  db: DB,
  id: number,
  data: { name: string; description: string; category: string; condition: string; quantity: number },
): Promise<SeedPacket> {
  const existing = await db
    .selectFrom("seed_packets")
    .select(["id", "claimed_by"])
    .where("id", "=", id)
    .executeTakeFirst();

  if (!existing) throw new Error("Packet not found");
  if (existing.claimed_by) throw new Error("Cannot update a claimed packet");

  await db
    .updateTable("seed_packets")
    .set({
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      condition: data.condition,
      quantity: data.quantity,
    })
    .where("id", "=", id)
    .execute();

  const updated = await db
    .selectFrom("seed_packets")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirstOrThrow();

  return updated;
}

export async function deletePacket(db: DB, id: number): Promise<void> {
  await db.deleteFrom("seed_packets").where("id", "=", id).execute();
}

// ─── Claiming ────────────────────────────────────────────────────────────────

export async function claimPacket(
  db: DB,
  id: number,
  data: { name: string },
): Promise<SeedPacket> {
  if (!data.name.trim()) throw new Error("Name is required");

  return await db.transaction().execute(async (tx) => {
    const packet = await tx
      .selectFrom("seed_packets")
      .select(["id", "claimed_by"])
      .where("id", "=", id)
      .executeTakeFirst();

    if (!packet) throw new Error("Packet not found");
    if (packet.claimed_by) throw new Error("Packet already claimed");

    await tx
      .updateTable("seed_packets")
      .set({ claimed_by: data.name.trim() })
      .where("id", "=", id)
      .execute();

    const updated = await tx
      .selectFrom("seed_packets")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirstOrThrow();

    return updated;
  });
}
