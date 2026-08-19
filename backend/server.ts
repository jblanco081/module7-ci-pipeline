import express from "express";
import { z } from "zod";
import { openDb } from "./db.ts";
import { securityHeaders, rateLimiter, requestLogger } from "./middleware.ts";
import {
  createPacket,
  getPacket,
  listPackets,
  updatePacket,
  deletePacket,
  claimPacket,
} from "./service.ts";

// ─── DB ──────────────────────────────────────────────────────────────────────

const dbPath = process.env.DB_PATH ?? "seedswap.db";
const db = openDb(dbPath);

// ─── Schemas ─────────────────────────────────────────────────────────────────

const PacketBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  condition: z.enum(["new", "used"], { message: "Condition must be 'new' or 'used'" }),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

const ClaimBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// ─── App ─────────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use(securityHeaders());
app.use(rateLimiter());
app.use(requestLogger());

// ─── Packets ─────────────────────────────────────────────────────────────────

app.get("/api/packets", async (req, res) => {
  const category = req.query.category as string | undefined;
  const claimedParam = req.query.claimed as string | undefined;
  const claimed =
    claimedParam === "true" ? true : claimedParam === "false" ? false : undefined;
  res.json(await listPackets(db, { category, claimed }));
});

app.get("/api/packets/:id", async (req, res) => {
  const packet = await getPacket(db, Number(req.params.id));
  if (!packet) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(packet);
});

app.post("/api/packets", async (req, res) => {
  const result = PacketBodySchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues.map((i) => i.message).join("; ") });
    return;
  }
  res.status(201).json(await createPacket(db, result.data));
});

app.put("/api/packets/:id", async (req, res) => {
  const result = PacketBodySchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues.map((i) => i.message).join("; ") });
    return;
  }
  try {
    res.json(await updatePacket(db, Number(req.params.id), result.data));
  } catch (err) {
    const message = (err as Error).message;
    if (message === "Cannot update a claimed packet") {
      res.status(409).json({ error: message });
    } else if (message === "Packet not found") {
      res.status(404).json({ error: message });
    } else {
      res.status(400).json({ error: message });
    }
  }
});

app.delete("/api/packets/:id", async (req, res) => {
  await deletePacket(db, Number(req.params.id));
  res.status(204).send();
});

// ─── Claiming ────────────────────────────────────────────────────────────────

app.post("/api/packets/:id/claim", async (req, res) => {
  const result = ClaimBodySchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues.map((i) => i.message).join("; ") });
    return;
  }
  try {
    const packet = await claimPacket(db, Number(req.params.id), result.data);
    res.json(packet);
  } catch (err) {
    const message = (err as Error).message;
    if (message === "Packet already claimed") {
      res.status(409).json({ error: message });
    } else if (message === "Packet not found") {
      res.status(404).json({ error: message });
    } else {
      res.status(400).json({ error: message });
    }
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3000);
app.listen(port, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
  console.log(`Backend listening on http://localhost:${port}`);
});
