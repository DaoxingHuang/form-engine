import * as THREE from "three";
import { create } from "zustand";

// 用户数据接口 / User Data Interface
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

// 运行状态枚举 / State Enum
export type PlanetStarState = "IDLE" | "COUNTDOWN" | "SPINNING" | "PAUSED" | "STOPPING" | "RESULT";

// 配置接口 / Configuration Interface
export interface PlanetStarConfig {
  cardCount: number;
  radius: number;
  cardWidth: number;
  cardHeight: number;
  spinSpeedMax: number;
  autoStartNextRound: boolean;
  autoStartDelay: number; // ms
  spinDuration: number; // ms
  totalUsers: number;
  swapInterval: number; // ms
  swapCount: number;
  particleCount: number;
  particleSpeedMax: number;
  cardScale: number;
  avatarSize: number;
  nicknameLimit: number;
  nicknameFontSize: number;
}

export const DEFAULT_CONFIG: PlanetStarConfig = {
  cardCount: 200,
  radius: 600,
  cardWidth: 60,
  cardHeight: 35,
  spinSpeedMax: 0.08,
  autoStartNextRound: true,
  autoStartDelay: 2000,
  spinDuration: 3000,
  totalUsers: 20000,
  swapInterval: 5000,
  swapCount: 20,
  particleCount: 1000,
  particleSpeedMax: 10,
  cardScale: 1.0,
  avatarSize: 1.0,
  nicknameLimit: 6,
  nicknameFontSize: 30
};

interface PlanetStarStore {
  // 状态 / State
  state: PlanetStarState;
  setState: (s: PlanetStarState) => void;

  // 配置 / Config
  config: PlanetStarConfig;
  setConfig: (c: PlanetStarConfig) => void;
  updateConfig: (c: Partial<PlanetStarConfig>) => void;

  // 数据 / Data
  allUsers: User[];
  visibleUsers: User[]; // 当前在星球上显示的用户 / Users currently on the planet
  setAllUsers: (users: User[]) => void;
  setVisibleUsers: (users: User[]) => void;

  // 纹理缓存 / Texture Cache
  textureCache: Map<string, THREE.Texture>;
  getCachedTexture: (id: string) => THREE.Texture | undefined;
  setCachedTexture: (id: string, tex: THREE.Texture) => void;
  clearTextureCache: () => void;

  // 获奖者 / Winners
  currentWinner: User | null;
  setCurrentWinner: (user: User | null) => void;
}

export const usePlanetStarStore = create<PlanetStarStore>((set, get) => ({
  state: "IDLE",
  setState: (s) => set({ state: s }),

  config: { ...DEFAULT_CONFIG },
  setConfig: (c) => set({ config: c }),
  updateConfig: (c) => set((state) => ({ config: { ...state.config, ...c } })),

  allUsers: [],
  visibleUsers: [],
  setAllUsers: (users) => set({ allUsers: users }),
  setVisibleUsers: (users) => set({ visibleUsers: users }),

  textureCache: new Map(),
  getCachedTexture: (id) => get().textureCache.get(id),
  setCachedTexture: (id, tex) => {
    const cache = get().textureCache;
    if (!cache.has(id)) {
      cache.set(id, tex);
      // 简单的缓存清理策略：如果太大则清理一半 / Simple cache cleanup
      if (cache.size > 2000) {
        const keys = Array.from(cache.keys());
        for (let i = 0; i < 1000; i++) cache.delete(keys[i]);
      }
    }
  },
  clearTextureCache: () => {
    get().textureCache.forEach((t) => t.dispose());
    get().textureCache.clear();
  },

  currentWinner: null,
  setCurrentWinner: (user) => set({ currentWinner: user })
}));

// 模拟数据生成器 / Mock Data Generator
export const generateUsers = (count: number): User[] => {
  const CUSTOM_USERS_DATA = [
    {
      name: "華5915",
      avatarUrl: "https://gw.alipayobjects.com/mdn/rms_47f090/afts/img/A*ti0gQIRkBd0AAAAAAAAAAAAAARQnAQ"
    },
    { name: "阿蛋儿富贵", avatarUrl: "https://tfs.alipayobjects.com/images/partner/T13.hXXcXXXXXXXXXX" },
    { name: "藏家_1ox6qjc9PM", avatarUrl: "https://tfs.alipayobjects.com/images/partner/T1.a4nXoVfXXXXXXXX" },
    {
      name: "道德经监督检查",
      avatarUrl: "https://tfs.alipayobjects.com/images/partner/TB1ErIUb_0yDuNjHv_OXXbBlVXa"
    },
    {
      name: "贰掌柜",
      avatarUrl: "https://gw.alipayobjects.com/mdn/rms_47f090/afts/img/A*ti0gQIRkBd0AAAAAAAAAAAAAARQnAQ"
    },
    {
      name: "精准出击",
      avatarUrl:
        "https://mdn.alipayobjects.com/afts/img/A*XnYCS6RXZ8AAAAAATZAAAAgAAQAAAQ/original?bz=mm_other&tid=afts_traceId"
    },
    {
      name: "嘉彧堂",
      avatarUrl: "https://gw.alipayobjects.com/mdn/rms_47f090/afts/img/A*ti0gQIRkBd0AAAAAAAAAAAAAARQnAQ"
    },
    { name: "小猪絮絮", avatarUrl: "https://tfs.alipayobjects.com/images/partner/TB1COWIcP9EDuNjmgXUXXbCKXXa" }
  ];

  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const template = CUSTOM_USERS_DATA[i % CUSTOM_USERS_DATA.length];
    const uid = (1322000000000000 + i).toString();
    users.push({
      id: uid,
      name: i < CUSTOM_USERS_DATA.length ? template.name : `${template.name}_${i}`,
      avatarUrl: template.avatarUrl
    });
  }
  return users;
};
