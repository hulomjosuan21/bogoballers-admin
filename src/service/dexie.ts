import Dexie, { type Table } from "dexie";
import { type Node, type Edge } from "@xyflow/react";
import type { FlowNodeData } from "@/types/manual";

export interface FlowStateStore {
  id: number;
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
}

export class BasketballLeagueDB extends Dexie {
  flowState!: Table<FlowStateStore>;

  constructor() {
    super("basketballLeagueDB");
    this.version(1).stores({
      flowState: "++id",
    });
  }
}

export const db = new BasketballLeagueDB();
