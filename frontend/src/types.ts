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
