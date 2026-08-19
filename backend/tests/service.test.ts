import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { freshDb, type DB } from "./helpers.ts";
import {
  createPacket,
  getPacket,
  listPackets,
  updatePacket,
  deletePacket,
  claimPacket,
} from "../service.ts";

// ─── createPacket ───────────────────────────────────────────────────────────

describe("createPacket", () => {
  let db: DB;
  before(() => { db = freshDb(); });

  it("creates a packet and returns it with correct fields", async () => {
    const p = await createPacket(db, {
      name: "Roma Tomato",
      description: "Great for sauces",
      category: "vegetable",
      condition: "new",
      quantity: 25,
    });
    assert.equal(p.name, "Roma Tomato");
    assert.ok(p.id > 0);
    assert.equal(p.quantity, 25);
    assert.equal(p.category, "vegetable");
    assert.equal(p.condition, "new");
    assert.equal(p.description, "Great for sauces");
    assert.equal(p.claimed_by, null);
  });

  it("throws when name is empty", async () => {
    await assert.rejects(
      () => createPacket(db, {
        name: "",
        description: "Desc",
        category: "herb",
        condition: "new",
        quantity: 10,
      }),
      /name/i,
    );
  });

  it("throws when quantity is zero or negative", async () => {
    await assert.rejects(
      () => createPacket(db, {
        name: "Bad Packet",
        description: "Desc",
        category: "herb",
        condition: "new",
        quantity: 0,
      }),
      /quantity/i,
    );
  });
});

// ─── getPacket ──────────────────────────────────────────────────────────────

describe("getPacket", () => {
  let db: DB;
  before(() => { db = freshDb(); });

  it("returns packet by id", async () => {
    const p = await createPacket(db, {
      name: "Basil",
      description: "Fragrant herb",
      category: "herb",
      condition: "new",
      quantity: 50,
    });
    const found = await getPacket(db, p.id);
    assert.ok(found);
    assert.equal(found.name, "Basil");
    assert.equal(found.quantity, 50);
  });

  it("returns null for unknown id", async () => {
    assert.equal(await getPacket(db, 99999), null);
  });
});

// ─── listPackets ────────────────────────────────────────────────────────────

describe("listPackets", () => {
  let db: DB;
  before(async () => {
    db = freshDb();
    const p1 = await createPacket(db, { name: "Tomato", description: "d", category: "vegetable", condition: "new", quantity: 10 });
    await createPacket(db, { name: "Basil", description: "d", category: "herb", condition: "new", quantity: 20 });
    await createPacket(db, { name: "Sunflower", description: "d", category: "flower", condition: "used", quantity: 5 });
    await claimPacket(db, p1.id, { name: "Alice" });
  });

  it("returns all packets", async () => {
    const list = await listPackets(db);
    assert.equal(list.length, 3);
  });

  it("filters by category", async () => {
    const herbs = await listPackets(db, { category: "herb" });
    assert.equal(herbs.length, 1);
    assert.equal(herbs[0].name, "Basil");
  });

  it("filters by claimed=true", async () => {
    const claimed = await listPackets(db, { claimed: true });
    assert.equal(claimed.length, 1);
    assert.equal(claimed[0].name, "Tomato");
  });

  it("filters by claimed=false", async () => {
    const unclaimed = await listPackets(db, { claimed: false });
    assert.equal(unclaimed.length, 2);
  });
});

// ─── updatePacket ───────────────────────────────────────────────────────────

describe("updatePacket", () => {
  let db: DB;
  before(() => { db = freshDb(); });

  it("updates packet fields correctly", async () => {
    const p = await createPacket(db, {
      name: "Old Name",
      description: "Old desc",
      category: "herb",
      condition: "new",
      quantity: 10,
    });
    const updated = await updatePacket(db, p.id, {
      name: "New Name",
      description: "New desc",
      category: "vegetable",
      condition: "used",
      quantity: 30,
    });
    assert.equal(updated.name, "New Name");
    assert.equal(updated.description, "New desc");
    assert.equal(updated.category, "vegetable");
    assert.equal(updated.condition, "used");
    assert.equal(updated.quantity, 30);
  });

  it("throws when packet is claimed", async () => {
    const p = await createPacket(db, {
      name: "Claimed Packet",
      description: "d",
      category: "flower",
      condition: "new",
      quantity: 5,
    });
    await claimPacket(db, p.id, { name: "Bob" });
    await assert.rejects(
      () => updatePacket(db, p.id, {
        name: "Updated",
        description: "d",
        category: "flower",
        condition: "new",
        quantity: 5,
      }),
      /claimed/i,
    );
  });
});

// ─── deletePacket ───────────────────────────────────────────────────────────

describe("deletePacket", () => {
  let db: DB;
  before(() => { db = freshDb(); });

  it("removes the packet", async () => {
    const p = await createPacket(db, { name: "Temp", description: "d", category: "herb", condition: "new", quantity: 5 });
    await deletePacket(db, p.id);
    assert.equal(await getPacket(db, p.id), null);
  });
});

// ─── claimPacket ────────────────────────────────────────────────────────────

describe("claimPacket", () => {
  let db: DB;
  before(() => { db = freshDb(); });

  it("claims a packet and returns it with claimed_by set", async () => {
    const p = await createPacket(db, { name: "Pea", description: "d", category: "vegetable", condition: "new", quantity: 30 });
    const claimed = await claimPacket(db, p.id, { name: "Jane" });
    assert.equal(claimed.claimed_by, "Jane");
    assert.equal(claimed.id, p.id);
  });

  it("throws on double claim", async () => {
    const p = await createPacket(db, { name: "Lavender", description: "d", category: "herb", condition: "new", quantity: 20 });
    await claimPacket(db, p.id, { name: "First" });
    await assert.rejects(
      () => claimPacket(db, p.id, { name: "Second" }),
      /already claimed/i,
    );
  });

  it("throws when name is empty", async () => {
    const p = await createPacket(db, { name: "Rose", description: "d", category: "flower", condition: "new", quantity: 10 });
    await assert.rejects(
      () => claimPacket(db, p.id, { name: "" }),
      /name/i,
    );
  });
});
