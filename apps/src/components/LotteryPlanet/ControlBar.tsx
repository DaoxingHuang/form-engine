type Props = {
  onStart: () => void;
  onPauseToggle: () => void;
  onStop: () => void;
  onResetView: () => void;
};

/**
 * ControlBar - 控制栏 (Start / Pause / Stop / Reset)
 * Simple presentational component so parent can provide handlers.
 */
export default function ControlBar({ onStart, onPauseToggle, onStop, onResetView }: Props) {
  return (
    <div className="glass-panel px-6 py-4 rounded-full flex gap-4 items-center">
      <button
        id="btn-start"
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-full"
        onClick={onStart}
      >
        🚀 开始抽奖
      </button>

      <button
        id="btn-pause"
        className="bg-gray-700 text-white font-bold py-3 px-6 rounded-full hidden"
        onClick={onPauseToggle}
      >
        ⏸ 暂停
      </button>

      <button
        id="btn-stop"
        className="bg-red-600/80 text-white font-bold py-3 px-6 rounded-full hidden"
        onClick={onStop}
      >
        ⏹ 停止
      </button>

      <div className="w-px h-8 bg-gray-600 mx-2" />
      <button onClick={onResetView} className="text-gray-400 hover:text-white text-sm">
        重置视角
      </button>
    </div>
  );
}
