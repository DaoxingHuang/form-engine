import create from "zustand";

/**
 * Lottery store: 使用 zustand 管理抽奖全局状态（中/英注释）
 * Lottery store: manage global lottery state with zustand (zh/en)
 */
export type LotteryState = "IDLE" | "COUNTDOWN" | "SPINNING" | "PAUSED" | "STOPPING" | "RESULT";

type User = {
  id: number;
  name: string;
  dept: string;
  avatarColor: string;
};

type Store = {
  state: LotteryState;
  users: User[];
  // single last winner (for compatibility) and winners list for multi-winner
  winner: User | null;
  winners: User[];
  // texture cache for lazy-loaded textures (keyed by user id)
  textureCache: Record<number, HTMLCanvasElement | string>;
  // actions
  setState: (s: LotteryState) => void;
  setUsers: (u: User[]) => void;
  setWinner: (w: User | null) => void;
  setWinners: (w: User[]) => void;
  // select N winners randomly (pure deterministic selection is not required here)
  selectWinners: (count: number) => User[];
  // texture cache helpers
  getCachedTexture: (id: number) => HTMLCanvasElement | string | undefined;
  setCachedTexture: (id: number, tex: HTMLCanvasElement | string) => void;
};

export const useLotteryStore = create<Store>((set, get) => ({
  state: "IDLE",
  users: [],
  winner: null,
  winners: [],
  textureCache: {},
  setState: (s) => set({ state: s }),
  setUsers: (u) => set({ users: u }),
  setWinner: (w) => set({ winner: w }),
  setWinners: (w) => set({ winners: w }),
  selectWinners: (count: number) => {
    const users = get().users;
    if (!users || users.length === 0) return [];
    const selected: User[] = [];
    const taken = new Set<number>();
    while (selected.length < count && taken.size < users.length) {
      const idx = Math.floor(Math.random() * users.length);
      if (!taken.has(idx)) {
        taken.add(idx);
        selected.push(users[idx]);
      }
    }
    set({ winners: selected, winner: selected[0] ?? null });
    return selected;
  },
  getCachedTexture: (id: number) => get().textureCache[id],
  setCachedTexture: (id: number, tex: HTMLCanvasElement | string) =>
    set((state) => ({ textureCache: { ...state.textureCache, [id]: tex } }))
}));

// Helper: generate demo users (中/英注释)
export function generateUsers(count = 200) {
  const users: User[] = [];
  const depts = ["技术部", "设计部", "运营部", "产品部", "市场部"];
  for (let i = 0; i < count; i++) {
    users.push({
      id: 1000 + i,
      name: `User_${Math.floor(Math.random() * 9000) + 1000}`,
      dept: depts[Math.floor(Math.random() * depts.length)],
      avatarColor: `hsl(${Math.random() * 360}, 70%, 60%)`
    });
  }
  return users;
}
