import { openDb } from "./db.ts";
import { createPacket, claimPacket } from "./service.ts";

const dbPath = process.env.DB_PATH ?? "seedswap.db";
const db = openDb(dbPath);

const packets = [
  {
    name: "Roma Tomato",
    description: "Classic paste tomato, great for sauces. Determinate variety, produces heavy yields.",
    category: "vegetable",
    condition: "new" as const,
    quantity: 25,
  },
  {
    name: "Genovese Basil",
    description: "Traditional Italian basil with large, fragrant leaves. Perfect for pesto.",
    category: "herb",
    condition: "new" as const,
    quantity: 50,
  },
  {
    name: "Sunflower Mammoth",
    description: "Giant sunflower variety that grows up to 12 feet tall. Great for borders.",
    category: "flower",
    condition: "used" as const,
    quantity: 15,
  },
  {
    name: "Sugar Snap Pea",
    description: "Sweet, crunchy pods perfect for snacking. Climbing variety needs trellis support.",
    category: "vegetable",
    condition: "new" as const,
    quantity: 30,
  },
  {
    name: "Strawberry Everbearing",
    description: "Produces fruit from spring through fall. Great for containers or garden beds.",
    category: "fruit",
    condition: "used" as const,
    quantity: 10,
  },
  {
    name: "Lavender English",
    description: "Fragrant perennial herb with purple flowers. Drought tolerant once established.",
    category: "herb",
    condition: "new" as const,
    quantity: 20,
  },
];

const created = [];
for (const packet of packets) {
  created.push(await createPacket(db, packet));
}

// Pre-claim a couple of packets
await claimPacket(db, created[2].id, { name: "Maria Garcia" });
await claimPacket(db, created[4].id, { name: "James Wilson" });

console.log(`Seeded ${packets.length} seed packets (2 pre-claimed).`);
