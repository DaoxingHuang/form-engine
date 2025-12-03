import { create } from "zustand";

export type User = {
  id: number;
  name: string;
  dept: string;
  avatarColor: string;
};

type PlanetMapState = {
  allUsers: User[];
  visibleUsers: User[];
  winners: User[];
  state: "IDLE" | "COUNTDOWN" | "SPINNING" | "PAUSED" | "STOPPING" | "RESULT";
  textureCache: Map<number, HTMLCanvasElement>;

  setAllUsers: (users: User[]) => void;
  setVisibleUsers: (users: User[]) => void;
  rotateUsers: (count: number) => void;
  setWinners: (winners: User[]) => void;
  setState: (state: PlanetMapState["state"]) => void;

  getCachedTexture: (id: number) => HTMLCanvasElement | undefined;
  setCachedTexture: (id: number, texture: HTMLCanvasElement) => void;
};

export const generateUsers = (count: number): User[] => {
  const users: User[] = [];
  const depts = ["技术部", "设计部", "运营部", "产品部", "市场部"];
  for (let i = 0; i < count; i++) {
    users.push({
      id: 1000 + i,
      name: `U_${Math.floor(Math.random() * 9000) + 1000}`,
      dept: depts[Math.floor(Math.random() * depts.length)],
      avatarColor: `hsl(${Math.random() * 360}, 70%, 60%)`
    });
  }
  return users;
};

export const usePlanetMapStore = create<PlanetMapState>((set, get) => ({
  allUsers: [],
  visibleUsers: [],
  winners: [],
  state: "IDLE",
  textureCache: new Map(),

  setAllUsers: (users) => set({ allUsers: users }),
  setVisibleUsers: (users) => set({ visibleUsers: users }),

  rotateUsers: (count) => {
    const { allUsers, visibleUsers } = get();
    if (allUsers.length === 0) return;

    // Logic from planet.html:
    // const visibleUsers = fullUserList.slice(0, visibleCount);
    // const usersToRotate = fullUserList.slice(0, visibleCount);
    // const remainingUsers = fullUserList.slice(visibleCount);
    // fullUserList = [...remainingUsers, ...usersToRotate];

    // In our store, we want to rotate `allUsers` and then update `visibleUsers`.
    // Wait, planet.html logic is: take current visible ones, move them to end of list.
    // So we rotate `allUsers`.

    const currentVisibleCount = visibleUsers.length > 0 ? visibleUsers.length : count;
    // If we haven't initialized visibleUsers yet, we might need to do that first.

    const usersToRotate = allUsers.slice(0, currentVisibleCount);
    const remainingUsers = allUsers.slice(currentVisibleCount);
    const newAllUsers = [...remainingUsers, ...usersToRotate];

    const newVisibleUsers = newAllUsers.slice(0, currentVisibleCount);

    set({
      allUsers: newAllUsers,
      visibleUsers: newVisibleUsers
    });
  },

  setWinners: (winners) => set({ winners }),
  setState: (state) => set({ state }),

  getCachedTexture: (id) => get().textureCache.get(id),
  setCachedTexture: (id, texture) => {
    const cache = get().textureCache;
    cache.set(id, texture);
    // No need to trigger re-render for cache update usually, but if we want to be strict:
    // set({ textureCache: new Map(cache) });
    // But for performance, mutating the map is often fine if we don't depend on it for rendering triggers.
    // Let's keep it simple.
  }
}));
