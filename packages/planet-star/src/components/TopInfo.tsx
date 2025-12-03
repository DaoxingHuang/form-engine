import React from "react";
import { usePlanetStarStore } from "../usePlanetStarStore";
import { BgmPlayer } from "./BgmPlayer";

export const TopInfo: React.FC = () => {
  const { allUsers, state, config } = usePlanetStarStore();
  const { text } = config;

  return (
    <div className="flex justify-between items-start pointer-events-auto w-full gap-3 md:gap-6">
      <div className="bg-[#111827] rounded-xl p-3 md:p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-white border border-white/10 backdrop-blur-md flex-1 min-w-0 max-w-fit">
        <h1 className="text-xl md:text-3xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-[#1dd1a1] via-[#a685e6] to-[#ff6b6b] tracking-wide truncate">
          {text.title}
        </h1>
        <div className="text-xs md:text-sm text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
          <span className="truncate">{text.subTitle}</span>
          <span className="text-cyan-300 font-bold font-mono text-base md:text-lg">
            {allUsers.length.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${
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
          <span className="text-xs md:text-sm font-semibold text-gray-300 truncate">
            {state === "IDLE" && text.statusIdle}
            {state === "COUNTDOWN" && text.statusCountdown}
            {state === "SPINNING" && text.statusSpinning}
            {state === "PAUSED" && text.statusPaused}
            {state === "STOPPING" && text.statusStopping}
            {state === "RESULT" && text.statusResult}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 pt-1">
        <BgmPlayer />
      </div>
    </div>
  );
};
