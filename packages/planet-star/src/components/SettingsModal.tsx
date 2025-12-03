import React, { useState } from "react";
import { usePlanetStarStore, type PlanetStarTextConfig } from "../usePlanetStarStore";

interface SettingsModalProps {
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSave }) => {
  const { config, updateConfig } = usePlanetStarStore();
  const [activeTab, setActiveTab] = useState<"general" | "text">("general");

  const handleTextChange = (key: keyof PlanetStarTextConfig, value: string) => {
    updateConfig({
      text: {
        ...config.text,
        [key]: value
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#111827] border border-gray-700 rounded-xl max-w-xl w-full mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">⚙ 设置</h2>
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                activeTab === "general" ? "bg-gray-600 text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              通用
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                activeTab === "text" ? "bg-gray-600 text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              文案
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {activeTab === "general" ? (
            <>
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

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg mt-2">
                <label className="text-sm font-medium text-gray-300">显示截图/录屏工具</label>
                <input
                  type="checkbox"
                  checked={config.showTools}
                  onChange={(e) => updateConfig({ showTools: e.target.checked })}
                  className="h-5 w-5 accent-cyan-500"
                />
              </div>

              {/* BGM URL Input */}
              <div className="space-y-2 mt-2 p-3 bg-gray-800 rounded-lg">
                <label className="text-sm font-medium text-gray-300">背景音乐链接 (BGM)</label>
                <input
                  type="text"
                  value={config.bgmUrl || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow empty or validate URL
                    updateConfig({ bgmUrl: val });
                  }}
                  placeholder="https://example.com/music.mp3"
                  className={`w-full bg-gray-900 border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 ${
                    config.bgmUrl && !/^https?:\/\/.+/.test(config.bgmUrl) ? "border-red-500" : "border-gray-700"
                  }`}
                />
                {config.bgmUrl && !/^https?:\/\/.+/.test(config.bgmUrl) && (
                  <p className="text-xs text-red-400">请输入有效的网络地址 (http/https)</p>
                )}
                <p className="text-xs text-gray-500">支持 mp3, wav, ogg 等格式的网络地址</p>
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
            </>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-gray-700 pb-2">
                  顶部信息栏
                </h3>
                <TextInput label="主标题" value={config.text.title} onChange={(v) => handleTextChange("title", v)} />
                <TextInput
                  label="副标题"
                  value={config.text.subTitle}
                  onChange={(v) => handleTextChange("subTitle", v)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    label="状态: 就绪"
                    value={config.text.statusIdle}
                    onChange={(v) => handleTextChange("statusIdle", v)}
                  />
                  <TextInput
                    label="状态: 启动中"
                    value={config.text.statusCountdown}
                    onChange={(v) => handleTextChange("statusCountdown", v)}
                  />
                  <TextInput
                    label="状态: 进行中"
                    value={config.text.statusSpinning}
                    onChange={(v) => handleTextChange("statusSpinning", v)}
                  />
                  <TextInput
                    label="状态: 暂停"
                    value={config.text.statusPaused}
                    onChange={(v) => handleTextChange("statusPaused", v)}
                  />
                  <TextInput
                    label="状态: 停止中"
                    value={config.text.statusStopping}
                    onChange={(v) => handleTextChange("statusStopping", v)}
                  />
                  <TextInput
                    label="状态: 结果"
                    value={config.text.statusResult}
                    onChange={(v) => handleTextChange("statusResult", v)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-gray-700 pb-2">
                  底部控制栏
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    label="按钮: 启动"
                    value={config.text.btnStart}
                    onChange={(v) => handleTextChange("btnStart", v)}
                  />
                  <TextInput
                    label="按钮: 启动中"
                    value={config.text.btnStarting}
                    onChange={(v) => handleTextChange("btnStarting", v)}
                  />
                  <TextInput
                    label="按钮: 暂停"
                    value={config.text.btnPause}
                    onChange={(v) => handleTextChange("btnPause", v)}
                  />
                  <TextInput
                    label="按钮: 继续"
                    value={config.text.btnResume}
                    onChange={(v) => handleTextChange("btnResume", v)}
                  />
                  <TextInput
                    label="按钮: 停止"
                    value={config.text.btnStop}
                    onChange={(v) => handleTextChange("btnStop", v)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-gray-700 pb-2">
                  结果弹窗
                </h3>
                <TextInput
                  label="标签文本"
                  value={config.text.modalTag}
                  onChange={(v) => handleTextChange("modalTag", v)}
                />
                <TextInput
                  label="主标题"
                  value={config.text.modalTitle}
                  onChange={(v) => handleTextChange("modalTitle", v)}
                />
                <TextInput
                  label="副标题"
                  value={config.text.modalSubTitle}
                  onChange={(v) => handleTextChange("modalSubTitle", v)}
                />
                <TextInput
                  label="感谢语"
                  value={config.text.modalMessage}
                  onChange={(v) => handleTextChange("modalMessage", v)}
                />
                <div className="grid grid-cols-3 gap-4">
                  <TextInput
                    label="按钮: 自动开始"
                    value={config.text.btnAutoStart}
                    onChange={(v) => handleTextChange("btnAutoStart", v)}
                  />
                  <TextInput
                    label="按钮: 等待"
                    value={config.text.btnWait}
                    onChange={(v) => handleTextChange("btnWait", v)}
                  />
                  <TextInput
                    label="按钮: 下一轮"
                    value={config.text.btnNext}
                    onChange={(v) => handleTextChange("btnNext", v)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-gray-700 pb-2">
                  其他提示
                </h3>
                <TextInput
                  label="演示数据提示"
                  value={config.text.msgDemoData}
                  onChange={(v) => handleTextChange("msgDemoData", v)}
                />
              </div>
            </div>
          )}
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

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
      />
    </div>
  );
}
