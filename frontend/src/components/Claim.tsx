import { useEffect, useState } from "react";
import { packets as api } from "../api.ts";
import type { SeedPacketSummary } from "../types.ts";
import { CategoryIcon } from "./CategoryIcon.tsx";

type Mode = "browse" | "form" | "confirmed";

export default function Claim() {
  const [list, setList] = useState<SeedPacketSummary[]>([]);
  const [mode, setMode] = useState<Mode>("browse");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const reload = () => void api.list({ claimed: false }).then(setList);
  useEffect(reload, []);

  function selectPacket(p: SeedPacketSummary) {
    setSelectedId(p.id);
    setSelectedName(p.name);
    setName("");
    setError("");
    setMode("form");
  }

  async function handleClaim() {
    if (!selectedId) return;
    try {
      await api.claim(selectedId, { name });
      setMode("confirmed");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function backToBrowse() {
    setMode("browse");
    setSelectedId(null);
    reload();
  }

  // ─── Browse ──────────────────────────────────────────────────────────────

  if (mode === "browse") {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-emerald-800">Claim a Seed Packet</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((p) => (
            <article
              key={p.id}
              className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
            >
              <div>
                <h2 className="font-semibold text-emerald-700 flex items-center gap-2">
                  <CategoryIcon category={p.category} />
                  {p.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1 capitalize">
                  {p.category} &middot; {p.condition}
                </p>
                <p className="text-sm mt-2">
                  <span className="font-medium">{p.quantity}</span> seeds available
                </p>
              </div>
              <button
                onClick={() => selectPacket(p)}
                className="mt-3 bg-emerald-600 text-white px-3 py-1.5 rounded text-sm hover:bg-emerald-700"
              >
                Claim
              </button>
            </article>
          ))}
        </div>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────────────────────

  if (mode === "form") {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-emerald-800">Claim {selectedName}</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Your Name</span>
            <input
              className="mt-1 block w-full border rounded px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              onClick={backToBrowse}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Back to Browse
            </button>
            <button
              onClick={() => void handleClaim()}
              className="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700"
            >
              Claim
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Confirmed ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-md mx-auto space-y-4 text-center">
      <div role="status" className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-2">
        <h2 className="text-xl font-bold text-green-800">Packet Claimed!</h2>
        <p className="text-green-700">
          You have successfully claimed <strong>{selectedName}</strong>.
        </p>
      </div>
      <button
        onClick={backToBrowse}
        className="text-emerald-600 hover:underline text-sm"
      >
        Back to Browse
      </button>
    </div>
  );
}
