import React from "react";
import { usePlanetStarStore } from "../usePlanetStarStore";

interface ControlBarProps {
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onResetView: () => void;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  onStart,
  onPause,
  onStop,
  onResetView,
  onOpenSettings,
  onToggleFullscreen
}) => {
  const { state } = usePlanetStarStore();

  return (
    <div className="flex justify-center items-end pb-8 pointer-events-auto relative w-full">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-3 rounded-full flex gap-3 items-center shadow-2xl">
        {/* Start Button */}
        {state === "IDLE" && (
          <button
            onClick={onStart}
            className="bg-gradient-to-r from-[#ff7eb3] via-[#a685e6] to-[#1dd1a1] text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 text-lg hover:scale-105 transition-transform shadow-[0_8px_25px_rgba(255,126,179,0.4)] border border-white/20"
          >
            <span className="text-2xl">🚀</span> 启动展示
          </button>
        )}

        {/* Loading State Button (during countdown) */}
        {state === "COUNTDOWN" && (
          <button
            disabled
            className="bg-gray-700 text-gray-300 font-bold py-3 px-8 rounded-full flex items-center gap-2 text-lg cursor-wait"
          >
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            启动中...
          </button>
        )}

        {/* Pause & Stop Buttons */}
        {(state === "SPINNING" || state === "PAUSED") && (
          <>
            <button
              onClick={onPause}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 px-6 rounded-full flex items-center gap-2 transition-colors backdrop-blur-md"
            >
              {state === "SPINNING" ? "⏸ 暂停" : "▶ 继续"}
            </button>
            <button
              onClick={onStop}
              className="bg-gradient-to-br from-[#ff416c] to-[#ff4b2b] text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 shadow-[0_8px_25px_rgba(255,75,43,0.4)] hover:scale-105 transition-transform border border-white/20"
            >
              <span className="text-xl">🛑</span> 停止并聚焦
            </button>
          </>
        )}

        {/* Separator */}
        <div
          className={`w-px h-8 bg-white/10 mx-1 transition-all duration-300 ${
            state === "IDLE" || state === "SPINNING" || state === "PAUSED" ? "opacity-100" : "opacity-0 w-0 mx-0"
          }`}
        ></div>

        <button
          onClick={onResetView}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
          title="重置视角"
        >
          ↺
        </button>
      </div>

      {/* Right Bottom Controls */}
      <div className="absolute bottom-6 right-0 bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-full flex gap-2 pointer-events-auto">
        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center text-white text-xl transition"
          title="设置"
        >
          ⚙
        </button>
        <button
          onClick={onToggleFullscreen}
          className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center text-white text-xl transition"
          title="全屏"
        >
          ⛶
        </button>
      </div>
    </div>
  );
};
