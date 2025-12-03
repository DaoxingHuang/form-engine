import React from "react";
import { usePlanetStarStore, type User } from "../usePlanetStarStore";

interface ResultModalProps {
  winner: User;
  autoNextCount: number | null;
  onClose: (autoStart: boolean) => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ winner, autoNextCount, onClose }) => {
  const { config } = usePlanetStarStore();
  const { text } = config;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-[#1a1a2e] rounded-2xl p-1 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-w-sm w-full mx-4 overflow-hidden">
        {/* Rotating Border Effect */}
        <div className="absolute inset-[-50%] bg-[conic-gradient(transparent,var(--tw-gradient-stops))] from-[#ff7eb3] via-[#42c2ff] to-[#9d7be8] animate-[spin_4s_linear_infinite] opacity-50 pointer-events-none"></div>

        <div className="relative bg-black/80 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center text-center h-full w-full">
          <button
            onClick={() => onClose(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
          >
            ✕
          </button>

          <div className="px-3 py-1 bg-yellow-600/20 text-yellow-300 text-xs font-semibold rounded-full mb-4">
            {text.modalTag}
          </div>
          <h2 className="text-3xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-br from-[#42c2ff] to-[#ff7eb3]">
            {text.modalTitle}
          </h2>
          <p className="text-xs text-gray-400 tracking-widest uppercase mb-6">{text.modalSubTitle}</p>

          <div className="relative w-28 h-28 mb-6">
            <div className="absolute inset-[-5px] rounded-full bg-gradient-to-tr from-[#ff7eb3] to-[#42c2ff] animate-pulse blur-sm"></div>
            <img
              src={winner.avatarUrl}
              alt="Avatar"
              className="relative w-full h-full rounded-full object-cover border-2 border-gray-700 bg-gray-800"
            />
          </div>

          <h3 className="text-2xl font-bold text-white mb-1">{winner.name}</h3>
          <p className="text-sm text-gray-400 font-mono mb-6">
            ID: {winner.id.slice(0, 2)}***{winner.id.slice(-4)}
          </p>

          <div className="w-full bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 flex items-center gap-3 mb-6">
            <span className="text-2xl">💖</span>
            <div className="text-white text-sm font-medium">{text.modalMessage}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full border-t border-white/10 pt-4">
            <button className="py-3 rounded-lg text-sm font-medium bg-gray-700/50 text-gray-400 cursor-default">
              {autoNextCount !== null ? `${text.btnAutoStart} (${autoNextCount}s)` : text.btnWait}
            </button>
            <button
              onClick={() => onClose(true)}
              className="bg-gradient-to-r from-[#ff7eb3] to-[#1dd1a1] text-white py-3 rounded-lg text-sm font-bold hover:opacity-90 transition"
            >
              {text.btnNext} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
