import React from "react";
import { usePlanetStarStore } from "../usePlanetStarStore";

export const TopInfo: React.FC = () => {
  const { allUsers, state } = usePlanetStarStore();

  return (
    <div className="flex justify-between items-start pointer-events-auto">
      <div className="bg-[#111827] rounded-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-white border border-white/10 backdrop-blur-md">
        <h1 className="text-3xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-[#1dd1a1] via-[#a685e6] to-[#ff6b6b] tracking-wide">
          鲸探四周年
        </h1>
        <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
          <span>创作者展示 | 参与人数:</span>
          <span className="text-cyan-300 font-bold font-mono text-lg">{allUsers.length.toLocaleString()}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              state === "IDLE"
                ? "bg-green-500"
                : state === "SPINNING"
                  ? "bg-red-500 animate-pulse"
                  : state === "PAUSED"
                    ? "bg-yellow-600"
                    : state === "STOPPING"
                      ? "bg-purple-500"
                      : "bg-yellow-500"
            }`}
          ></div>
          <span className="text-sm font-semibold text-gray-300">
            {state === "IDLE" && "就绪 (IDLE)"}
            {state === "COUNTDOWN" && "启动中..."}
            {state === "SPINNING" && "展示进行中..."}
            {state === "PAUSED" && "已暂停"}
            {state === "STOPPING" && "正在聚焦..."}
            {state === "RESULT" && "结果展示"}
          </span>
        </div>
      </div>
    </div>
  );
};
