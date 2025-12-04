import React from "react";
import { usePlanetStarStore } from "../usePlanetStarStore";

interface SettingsModalProps {
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSave }) => {
  const { config, updateConfig } = usePlanetStarStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#111827] border border-gray-700 rounded-xl max-w-xl w-full mx-4 flex flex-col max-h-[90vh]">
        <h2 className="text-2xl font-bold p-6 border-b border-gray-700 text-white">⚙ 设置</h2>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Auto Start Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <label className="text-sm font-medium text-gray-300">展示结束后自动开始下一轮</label>
            <input
              type="checkbox"
              checked={config.autoStartNextRound}
              onChange={(e) => updateConfig({ autoStartNextRound: e.target.checked })}
              className="h-5 w-5 accent-cyan-500"
            />
          </div>

          {/* Sliders */}
          <SettingSlider
            label="自动开始延迟 (秒)"
            value={config.autoStartDelay / 1000}
            min={1}
            max={10}
            step={1}
            onChange={(v) => updateConfig({ autoStartDelay: v * 1000 })}
          />
          <SettingSlider
            label="展示持续时间 (秒)"
            value={config.spinDuration / 1000}
            min={1}
            max={10}
            step={1}
            onChange={(v) => updateConfig({ spinDuration: v * 1000 })}
          />
          <SettingSlider
            label="星球卡片数量"
            value={config.cardCount}
            min={50}
            max={500}
            step={10}
            onChange={(v) => updateConfig({ cardCount: v })}
          />
          <SettingSlider
            label="旋转速度"
            value={config.spinSpeedMax}
            min={0.01}
            max={0.2}
            step={0.01}
            onChange={(v) => updateConfig({ spinSpeedMax: v })}
          />

          <hr className="border-gray-700" />

          <SettingSlider
            label="轮换间隔 (秒)"
            value={config.swapInterval / 1000}
            min={1}
            max={10}
            step={1}
            onChange={(v) => updateConfig({ swapInterval: v * 1000 })}
          />
          <SettingSlider
            label="单次轮换数量"
            value={config.swapCount}
            min={5}
            max={50}
            step={5}
            onChange={(v) => updateConfig({ swapCount: v })}
          />
          <SettingSlider
            label="背景粒子数量"
            value={config.particleCount}
            min={100}
            max={3000}
            step={100}
            onChange={(v) => updateConfig({ particleCount: v })}
          />

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">卡片外观配置</h3>
            <SettingSlider
              label="卡片尺寸缩放"
              value={config.cardScale}
              min={0.5}
              max={2.0}
              step={0.1}
              suffix="x"
              onChange={(v) => updateConfig({ cardScale: v })}
            />
            <SettingSlider
              label="头像大小系数"
              value={config.avatarSize}
              min={0.5}
              max={1.3}
              step={0.1}
              suffix="x"
              onChange={(v) => updateConfig({ avatarSize: v })}
            />
            <SettingSlider
              label="昵称字体大小"
              value={config.nicknameFontSize}
              min={20}
              max={60}
              step={1}
              suffix="px"
              onChange={(v) => updateConfig({ nicknameFontSize: v })}
            />
            <SettingSlider
              label="昵称最大显示长度"
              value={config.nicknameLimit}
              min={3}
              max={12}
              step={1}
              suffix="字"
              onChange={(v) => updateConfig({ nicknameLimit: v })}
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded text-gray-400 hover:text-white transition">
            取消
          </button>
          <button
            onClick={onSave}
            className="bg-gradient-to-r from-[#ff7eb3] to-[#1dd1a1] text-white px-6 py-2 rounded font-bold text-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Sliders
function SettingSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = ""
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">
        {label} (<span className="text-cyan-400">{value.toFixed(step < 1 ? 2 : 0)}</span>
        {suffix})
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
      />
    </div>
  );
}
