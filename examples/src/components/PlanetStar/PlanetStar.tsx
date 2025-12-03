import { useEffect, useRef, useState } from "react";
import { ControlBar } from "./components/ControlBar";
import { ResultModal } from "./components/ResultModal";
import { SettingsModal } from "./components/SettingsModal";
import { TopInfo } from "./components/TopInfo";
import { usePlanetStarScene } from "./usePlanetStarScene";
import { DEFAULT_CONFIG, generateUsers, usePlanetStarStore } from "./usePlanetStarStore";

/**
 * PlanetStar Component
 *
 * 这是一个基于 的 React 组件实现。
 * 它包含了一个 3D 星球抽奖场景，以及配套的 UI 控制（开始、暂停、停止、结果展示、设置）。
 */
export default function PlanetStar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, setState, allUsers, setAllUsers, setVisibleUsers, currentWinner, config, setConfig } =
    usePlanetStarStore();
  const { stopLottery, resetView } = usePlanetStarScene(containerRef);

  // 倒计时状态 / Countdown State
  const [countdown, setCountdown] = useState<number | null>(null);
  // 自动下一轮倒计时 / Auto Next Round Countdown
  const [autoNextCount, setAutoNextCount] = useState<number | null>(null);
  // 设置弹窗状态 / Settings Modal State
  const [showSettings, setShowSettings] = useState(false);

  // 初始化数据 / Initialize Data
  useEffect(() => {
    // Load config from local storage
    const savedConfig = localStorage.getItem("lotteryConfig_v3");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch (e) {
        console.error("Failed to load config", e);
      }
    }

    if (allUsers.length === 0) {
      const users = generateUsers(config.totalUsers);
      setAllUsers(users);
      setVisibleUsers(users.slice(0, config.cardCount));
    }
  }, []);

  // 自动停止逻辑 / Auto Stop Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state === "SPINNING") {
      timer = setTimeout(() => {
        // Check if still spinning (user might have paused or stopped manually)
        if (usePlanetStarStore.getState().state === "SPINNING") {
          handleStop();
        }
      }, config.spinDuration);
    }
    return () => clearTimeout(timer);
  }, [state, config.spinDuration]);

  // 开始抽奖处理 / Handle Start
  const handleStart = (withCountdown = true) => {
    // Use getState() to ensure we have the latest state, especially when called immediately after setState
    if (usePlanetStarStore.getState().state !== "IDLE") return;

    if (withCountdown) {
      setState("COUNTDOWN");
      let count = 3;
      setCountdown(count);
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
          setCountdown(null);
          setState("SPINNING");
        }
      }, 1000);
    } else {
      setState("SPINNING");
    }
  };

  // 暂停/继续处理 / Handle Pause/Resume
  const handlePause = () => {
    if (state === "SPINNING") setState("PAUSED");
    else if (state === "PAUSED") setState("SPINNING");
  };

  // 停止抽奖处理 / Handle Stop
  const handleStop = () => {
    if (state !== "SPINNING" && state !== "PAUSED") return;
    setState("STOPPING");
    stopLottery(() => {
      setState("RESULT");
      // 自动开始下一轮逻辑 / Auto Start Next Round Logic
      if (config.autoStartNextRound) {
        let autoCount = config.autoStartDelay / 1000;
        setAutoNextCount(autoCount);
        const autoTimer = setInterval(() => {
          autoCount--;
          setAutoNextCount(autoCount);
          if (autoCount <= 0) {
            clearInterval(autoTimer);
            handleCloseResult(true);
          }
        }, 1000);
        (window as any)._autoNextTimer = autoTimer;
      }
    });
  };

  // 关闭结果弹窗 / Close Result Modal
  const handleCloseResult = (autoStart = false) => {
    if ((window as any)._autoNextTimer) clearInterval((window as any)._autoNextTimer);
    setAutoNextCount(null);

    // Close modal immediately
    setState("IDLE");

    // Reset view in background
    resetView();

    // Start next round immediately if requested
    if (autoStart) {
      handleStart(false);
    }
  };

  // 仅重置视角 / Reset View Only
  const handleResetView = () => {
    resetView();
  };

  // 全屏切换 / Toggle Fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 保存设置 / Save Settings
  const handleSaveSettings = () => {
    localStorage.setItem("lotteryConfig_v3", JSON.stringify(config));
    setShowSettings(false);
  };

  return (
    <div className="relative w-full h-screen bg-[#000008] overflow-hidden font-sans text-white">
      {/* 3D 容器 / 3D Container */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* UI 层 / UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        {/* 顶部信息 / Top Info */}
        <TopInfo />

        {/* 倒计时覆盖层 / Countdown Overlay */}
        {state === "COUNTDOWN" && countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-[150px] font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] animate-bounce">
              {countdown}
            </div>
          </div>
        )}

        {/* 底部控制栏 / Bottom Control Bar */}
        <ControlBar
          onStart={() => handleStart(true)}
          onPause={handlePause}
          onStop={handleStop}
          onResetView={handleResetView}
          onOpenSettings={() => setShowSettings(true)}
          onToggleFullscreen={toggleFullScreen}
        />
      </div>

      {/* 结果弹窗 / Result Modal */}
      {state === "RESULT" && currentWinner && (
        <ResultModal winner={currentWinner} autoNextCount={autoNextCount} onClose={handleCloseResult} />
      )}

      {/* 设置弹窗 / Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onSave={handleSaveSettings} />}
    </div>
  );
}
