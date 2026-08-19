import { useEffect, useState } from "react";
import { packets as api } from "../api.ts";
import type { SeedPacketSummary, SeedPacket } from "../types.ts";
import { CategoryIcon } from "./CategoryIcon.tsx";

interface PacketForm {
  name: string;
  description: string;
  category: string;
  condition: string;
  quantity: string;
}

const emptyForm: PacketForm = { name: "", description: "", category: "vegetable", condition: "new", quantity: "" };

export default function Packets() {
  const [list, setList] = useState<SeedPacketSummary[]>([]);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<PacketForm>(emptyForm);
  const [viewing, setViewing] = useState<SeedPacket | null>(null);
  const [error, setError] = useState("");

  const reload = () => void api.list().then(setList);
  useEffect(reload, []);

  function openCreate() {
    setForm(emptyForm);
    setEditing("new");
    setError("");
  }

  async function openEdit(p: SeedPacketSummary) {
    setError("");
    const full = await api.get(p.id);
    setForm({
      name: full.name,
      description: full.description,
      category: full.category,
      condition: full.condition,
      quantity: String(full.quantity),
    });
    setEditing(p.id);
  }

  async function openView(p: SeedPacketSummary) {
    const full = await api.get(p.id);
    setViewing(full);
  }

  async function handleSave() {
    try {
      const data = {
        name: form.name,
        description: form.description,
        category: form.category,
        condition: form.condition,
        quantity: Number(form.quantity),
      };
      if (editing === "new") {
        await api.create(data);
      } else if (typeof editing === "number") {
        await api.update(editing, data);
      }
      setEditing(null);
      reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(id: number) {
    await api.delete(id);
    reload();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-800">Seed Packets</h1>
        <button
          onClick={openCreate}
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 text-sm"
        >
          Add Packet
        </button>
      </div>

      <table className="w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-100 text-left text-sm text-gray-600">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Condition</th>
            <th className="px-4 py-2">Qty</th>
            <th className="px-4 py-2">Claimed By</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id} data-testid="packet-row" className="border-t text-sm">
              <td className="px-4 py-2 flex items-center gap-2">
                <CategoryIcon category={p.category} />
                {p.name}
              </td>
              <td className="px-4 py-2 capitalize">{p.category}</td>
              <td className="px-4 py-2 capitalize">{p.condition}</td>
              <td className="px-4 py-2">{p.quantity}</td>
              <td className="px-4 py-2">{p.claimed_by ?? "—"}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => void openView(p)}
                  className="text-emerald-600 hover:underline text-xs"
                >
                  View
                </button>
                <button
                  onClick={() => void openEdit(p)}
                  className="text-emerald-600 hover:underline text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => void handleDelete(p.id)}
                  className="text-red-600 hover:underline text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create / Edit Modal */}
      {editing !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <div data-testid="modal" className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">
              {editing === "new" ? "Add Packet" : "Edit Packet"}
            </h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <label className="block">
              <span className="text-sm font-medium">Name</span>
              <input
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Description</span>
              <textarea
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Category</span>
              <select
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="vegetable">Vegetable</option>
                <option value="herb">Herb</option>
                <option value="flower">Flower</option>
                <option value="fruit">Fruit</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Condition</span>
              <select
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Quantity</span>
              <input
                type="number"
                min="1"
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSave()}
                className="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <div data-testid="modal" className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CategoryIcon category={viewing.category} />
              {viewing.name}
            </h2>
            <p className="text-sm text-gray-600">{viewing.description}</p>
            <div className="text-sm space-y-1">
              <p><strong>Category:</strong> <span className="capitalize">{viewing.category}</span></p>
              <p><strong>Condition:</strong> <span className="capitalize">{viewing.condition}</span></p>
              <p><strong>Quantity:</strong> {viewing.quantity}</p>
              <p><strong>Claimed By:</strong> {viewing.claimed_by ?? "Not claimed"}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewing(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
