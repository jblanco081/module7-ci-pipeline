import { useEffect, useState } from "react";
import { packets } from "../api.ts";
import type { SeedPacketSummary } from "../types.ts";

export default function Home() {
  const [list, setList] = useState<SeedPacketSummary[]>([]);

  useEffect(() => {
    void packets.list().then(setList);
  }, []);

  const available = list.filter((p) => !p.claimed_by).length;

  return (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <h1 className="text-3xl font-bold text-emerald-800">Welcome to SeedSwap</h1>
      <p className="text-gray-600">
        Share and discover seed packets from your community. Browse available seeds, claim what you
        need, and contribute your extras.
      </p>
      <div className="flex justify-center gap-8 mt-8">
        <div className="bg-white rounded-lg shadow p-6 w-40">
          <div className="text-3xl font-bold text-emerald-600">{list.length}</div>
          <div className="text-sm text-gray-500 mt-1">Total Packets</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 w-40">
          <div className="text-3xl font-bold text-emerald-600">{available}</div>
          <div className="text-sm text-gray-500 mt-1">Available</div>
        </div>
      </div>
    </div>
  );
}
