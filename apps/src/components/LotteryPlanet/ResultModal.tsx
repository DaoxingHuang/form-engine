type User = {
  id: number;
  name: string;
  dept: string;
  avatarColor: string;
};

type Props = {
  open: boolean;
  winners: User[];
  // remaining seconds until auto-start (optional)
  autoRemaining?: number;
  // handlers for manual start / manual close
  onManualStart: () => void;
  onManualClose: () => void;
};

/**
 * ResultModal - shows winner(s) in a modal with basic actions
 */
export default function ResultModal({ open, winners, autoRemaining, onManualStart, onManualClose }: Props) {
  const first = winners && winners.length > 0 ? winners[0] : null;
  return (
    <div className={`fixed inset-0 bg-black/80 z-50 ${open ? "flex" : "hidden"} items-center justify-center`}>
      <div className="anniversary-card max-w-md w-full mx-4 transform scale-0 opacity-0">
        <div className="card-inner p-8 relative overflow-hidden">
          <div className="bg-deco-number">4</div>
          <div className="text-center mb-6 z-10 relative">
            <div className="inline-block px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs tracking-widest mb-2">
              ANNIVERSARY
            </div>
            <h2 className="text-4xl font-black ribbon-text tracking-tight">恭喜中奖!</h2>
            <p className="text-gray-400 text-sm mt-1">LUCKY WINNER</p>
          </div>

          <div className="relative flex justify-center mb-6 z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full blur-xl opacity-40 animate-pulse w-32 h-32 mx-auto top-[-10px]" />
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-yellow-300 via-pink-500 to-cyan-400">
              <img
                id="winner-avatar"
                src=""
                style={{ backgroundColor: first?.avatarColor }}
                className="w-28 h-28 rounded-full border-4 border-[#0f1016] object-cover bg-gray-800"
              />
            </div>
          </div>

          <div className="text-center mb-8 z-10 relative">
            <h3 id="winner-name" className="text-3xl text-white font-bold mb-1 drop-shadow-md">
              {first?.name ?? "Unknown"}
            </h3>
            <p
              id="winner-id"
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 font-mono"
            >
              ID: {first?.id ?? "N/A"} | {first?.dept ?? ""}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 relative z-10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎁</div>
              <div className="text-left">
                <p className="text-gray-400 text-xs uppercase">Prize</p>
                <p className="text-lg font-bold text-white leading-tight">4周年限定神秘大礼包</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <button
              id="btn-auto-next"
              className="btn-auto-next border border-white/20 text-gray-300 py-3 rounded-xl transition text-sm font-medium cursor-default"
            >
              <span id="auto-countdown-text">
                {typeof autoRemaining === "number" ? `${autoRemaining}秒后自动开始下一轮` : "等待中..."}
              </span>
            </button>
            <button
              onClick={onManualStart}
              className="btn-gradient-theme text-white py-3 rounded-xl transition font-bold shadow-lg flex justify-center items-center gap-2 text-sm"
            >
              <span className="text-lg">▶️</span> 立即开始下一轮
            </button>
          </div>

          <button
            onClick={onManualClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white z-20 transition transform hover:rotate-90"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
