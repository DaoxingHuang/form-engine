import React from "react";
import { usePlanetStarStore } from "../usePlanetStarStore";

interface ControlBarProps {
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onResetView: () => void;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
  onScreenshot?: () => void;
  onStartRecord?: () => void;
  onStopRecord?: () => void;
  isRecording?: boolean;
  showBottomControls?: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  onStart,
  onPause,
  onStop,
  onResetView,
  onOpenSettings,
  onToggleFullscreen,
  onScreenshot,
  onStartRecord,
  onStopRecord,
  isRecording,
  showBottomControls = true
}) => {
  const { state, config } = usePlanetStarStore();
  const { text } = config;

  return (
    <div className="flex justify-center items-end pb-4 md:pb-8 pointer-events-auto relative w-full">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-2 py-2 md:px-3 md:py-3 rounded-full flex gap-2 md:gap-3 items-center shadow-2xl">
        {/* Start Button */}
        {state === "IDLE" && (
          <button
            onClick={onStart}
            className="bg-gradient-to-r from-[#ff7eb3] via-[#a685e6] to-[#1dd1a1] text-white font-bold py-2 px-5 md:py-3 md:px-8 rounded-full flex items-center gap-2 text-sm md:text-lg hover:scale-105 transition-transform shadow-[0_8px_25px_rgba(255,126,179,0.4)] border border-white/20"
          >
            <span className="text-lg md:text-2xl">🚀</span> {text.btnStart}
          </button>
        )}

        {/* Loading State Button (during countdown) */}
        {state === "COUNTDOWN" && (
          <button
            disabled
            className="bg-gray-700 text-gray-300 font-bold py-2 px-5 md:py-3 md:px-8 rounded-full flex items-center gap-2 text-sm md:text-lg cursor-wait"
          >
            <svg
              className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white"
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
            {text.btnStarting}
          </button>
        )}

        {/* Pause & Stop Buttons */}
        {(state === "SPINNING" || state === "PAUSED") && (
          <>
            <button
              onClick={onPause}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2 px-4 md:py-3 md:px-6 rounded-full flex items-center gap-2 transition-colors backdrop-blur-md text-sm md:text-base"
            >
              {state === "SPINNING" ? `⏸ ${text.btnPause}` : `▶ ${text.btnResume}`}
            </button>
            <button
              onClick={onStop}
              className="bg-gradient-to-br from-[#ff416c] to-[#ff4b2b] text-white font-bold py-2 px-5 md:py-3 md:px-8 rounded-full flex items-center gap-2 shadow-[0_8px_25px_rgba(255,75,43,0.4)] hover:scale-105 transition-transform border border-white/20 text-sm md:text-base"
            >
              <span className="text-lg md:text-xl">🛑</span> {text.btnStop}
            </button>
          </>
        )}

        {/* Separator */}
        <div
          className={`w-px h-6 md:h-8 bg-white/10 mx-0.5 md:mx-1 transition-all duration-300 ${
            state === "IDLE" || state === "SPINNING" || state === "PAUSED" ? "opacity-100" : "opacity-0 w-0 mx-0"
          }`}
        ></div>

        <button
          onClick={onResetView}
          className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
          title="重置视角"
        >
          ↺
        </button>
      </div>

      {/* Right Bottom Controls */}
      {showBottomControls && (
        <div className="absolute bottom-4 right-0 md:bottom-6 bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 md:p-2 rounded-full flex gap-1 md:gap-2 pointer-events-auto scale-90 md:scale-100 origin-bottom-right">
          {config.showTools && (
            <>
              <button
                onClick={onScreenshot}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-white/20 flex items-center justify-center text-white text-lg md:text-xl transition"
                title="截图"
              >
                📸
              </button>
              <button
                onClick={isRecording ? onStopRecord : onStartRecord}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-white/20 flex items-center justify-center text-lg md:text-xl transition ${
                  isRecording ? "text-red-500 animate-pulse" : "text-white"
                }`}
                title={isRecording ? "停止录屏" : "开始录屏"}
              >
                {isRecording ? "⏹" : "⏺"}
              </button>
              <div className="w-px h-5 md:h-6 bg-white/10 mx-0.5 md:mx-1 self-center"></div>
            </>
          )}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-white/20 flex items-center justify-center text-white text-lg md:text-xl transition"
            title="设置"
          >
            ⚙
          </button>
          <button
            onClick={onToggleFullscreen}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-white/20 flex items-center justify-center text-white text-lg md:text-xl transition"
            title="全屏"
          >
            ⛶
          </button>
        </div>
      )}
    </div>
  );
};
