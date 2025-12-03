type Props = {
  count: number;
  stateLabel: string;
};

/**
 * StatusPanel - top-left status information (用户数 / 状态)
 */
export default function StatusPanel({ count, stateLabel }: Props) {
  return (
    <div className="glass-panel p-4 rounded-xl text-white">
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
        LOTTERY PLANET
      </h1>
      <div className="text-xs text-gray-400 mt-1">
        当前参与人数: <span className="text-cyan-300">{count}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${stateLabel === "IDLE" ? "bg-green-500" : "bg-yellow-500"}`} />
        <span className="text-sm font-mono text-gray-300">{stateLabel}</span>
      </div>
    </div>
  );
}
