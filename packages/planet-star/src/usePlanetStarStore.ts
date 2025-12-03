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

export interface PlanetStarTextConfig {
  // TopInfo
  title: string;
  subTitle: string;
  statusIdle: string;
  statusCountdown: string;
  statusSpinning: string;
  statusPaused: string;
  statusStopping: string;
  statusResult: string;

  // ControlBar
  btnStart: string;
  btnStarting: string;
  btnPause: string;
  btnResume: string;
  btnStop: string;

  // ResultModal
  modalTag: string;
  modalTitle: string;
  modalSubTitle: string;
  modalMessage: string;
  btnAutoStart: string;
  btnWait: string;
  btnNext: string;

  // Messages
  msgDemoData: string;
}

// 配置接口 / Configuration Interface
// Defines all customizable parameters for the lottery system.
// 定义抽奖系统的所有可配置参数。
export interface PlanetStarConfig {
  text: PlanetStarTextConfig;
  cardCount: number; // Number of cards visible on the planet / 星球上可见的卡片数量
  radius: number; // Radius of the planet / 星球半径
  cardWidth: number; // Width of each card / 卡片宽度
  cardHeight: number; // Height of each card / 卡片高度
  spinSpeedMax: number; // Max rotation speed when spinning / 旋转时的最大速度
  autoStartNextRound: boolean; // Whether to auto-start next round / 是否自动开始下一轮
  autoStartDelay: number; // Delay before auto-start (ms) / 自动开始前的延迟（毫秒）
  spinDuration: number; // Duration of the spin (ms) / 旋转持续时间（毫秒）
  totalUsers: number; // Total expected users (for simulation) / 总预期用户数（用于模拟）
  swapInterval: number; // Interval for swapping cards (ms) / 卡片轮换间隔（毫秒）
  swapCount: number; // Number of cards to swap per interval / 每次轮换的卡片数量
  particleCount: number; // Number of background particles / 背景粒子数量
  particleSpeedMax: number; // Max speed of particles / 粒子最大速度
  cardScale: number; // Scale factor for cards / 卡片缩放因子
  avatarSize: number; // Relative size of avatar on card / 卡片上头像的相对大小
  nicknameLimit: number; // Max characters for nickname / 昵称最大字符数
  nicknameFontSize: number; // Font size for nickname / 昵称字体大小
  showTools: boolean; // Whether to show screenshot/record tools / 是否显示截图/录屏工具
  bgmUrl: string; // Background music URL / 背景音乐地址
}

export const DEFAULT_CONFIG: PlanetStarConfig = {
  text: {
    title: "鲸探四周年",
    subTitle: "创作者展示 | 参与人数:",
    statusIdle: "就绪 (IDLE)",
    statusCountdown: "启动中...",
    statusSpinning: "展示进行中...",
    statusPaused: "已暂停",
    statusStopping: "正在聚焦...",
    statusResult: "结果展示",
    btnStart: "启动展示",
    btnStarting: "启动中...",
    btnPause: "暂停",
    btnResume: "继续",
    btnStop: "停止并聚焦",
    modalTag: "周年感谢",
    modalTitle: "鲸探创作者",
    modalSubTitle: "感谢有你",
    modalMessage: "感谢您为平台带来的独特价值",
    btnAutoStart: "自动开始",
    btnWait: "等待操作",
    btnNext: "下一轮",
    msgDemoData: "当前为演示数据"
  },
  cardCount: 200,
  radius: 600,
  cardWidth: 60,
  cardHeight: 35,
  spinSpeedMax: 0.08,
  autoStartNextRound: true,
  autoStartDelay: 2000,
  spinDuration: 3000,
  totalUsers: 20971,
  swapInterval: 5000,
  swapCount: 5,
  particleCount: 1000,
  particleSpeedMax: 2,
  cardScale: 1.0,
  avatarSize: 0.6,
  nicknameLimit: 8,
  nicknameFontSize: 24,
  showTools: true,
  bgmUrl: ""
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
