import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ControlBar } from "./components/ControlBar";
import { ResultModal } from "./components/ResultModal";
import { SettingsModal } from "./components/SettingsModal";
import { TopInfo } from "./components/TopInfo";
import { usePlanetStarScene } from "./usePlanetStarScene";
import { DEFAULT_CONFIG, usePlanetStarStore, type PlanetStarConfig, type User } from "./usePlanetStarStore";

export interface PlanetStarRef {
  start: (withCountdown?: boolean) => void;
  pause: () => void;
  stop: () => void;
  resetView: () => void;
  toggleFullscreen: () => void;
  openSettings: () => void;
}

export interface PlanetStarProps extends Partial<PlanetStarConfig> {
  users?: User[] | Promise<User[]>;
  demoUsers?: User[];
  showBottomControls?: boolean;
}

/**
 * PlanetStar Component
 *
 * 这是一个基于 planetPlus.html 的 React 组件实现。
 * 它包含了一个 3D 星球抽奖场景，以及配套的 UI 控制（开始、暂停、停止、结果展示、设置）。
 */
export const PlanetStar = forwardRef<PlanetStarRef, PlanetStarProps>((props, ref) => {
  const { users, demoUsers, showBottomControls = true, ...configProps } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, setState, setAllUsers, setVisibleUsers, currentWinner, config, setConfig } = usePlanetStarStore();
  const { stopLottery, resetView } = usePlanetStarScene(containerRef);

  // 倒计时状态 / Countdown State
  const [countdown, setCountdown] = useState<number | null>(null);
  // 自动下一轮倒计时 / Auto Next Round Countdown
  const [autoNextCount, setAutoNextCount] = useState<number | null>(null);
  // 设置弹窗状态 / Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  // 数据加载状态 / Data Loading State
  const [isLoadingData, setIsLoadingData] = useState(false);
  // 是否使用演示数据 / Is Demo Data
  const [isDemoData, setIsDemoData] = useState(false);
  // 录屏状态 / Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // 初始化数据 / Initialize Data
  useEffect(() => {
    // Load config from local storage
    const savedConfigStr = localStorage.getItem("lotteryConfig_v3");
    let savedConfig: Partial<PlanetStarConfig> = {};
    if (savedConfigStr) {
      try {
        savedConfig = JSON.parse(savedConfigStr);
      } catch (e) {
        console.error("Failed to load config", e);
      }
    }

    // Merge: Default -> Saved -> Props
    // 优先级：Props > Local Storage > Default
    const mergedConfig: PlanetStarConfig = {
      ...DEFAULT_CONFIG,
      ...savedConfig,
      ...configProps,
      text: {
        ...DEFAULT_CONFIG.text,
        ...(savedConfig.text || {}),
        ...(configProps.text || {})
      }
    };

    setConfig(mergedConfig);
  }, [JSON.stringify(configProps)]); // Use stringify to avoid deep dependency issues    // 监听 users 属性变化 / Watch users prop
  // Handles data loading from props, supporting both Array and Promise.
  // 处理来自 props 的数据加载，支持数组和 Promise。
  useEffect(() => {
    console.log("PlanetStar: users prop changed", users);
    if (!users) return;
    const handleUsersUpdate = async () => {
      // Case 1: Array
      // 直接传入数组的情况 / Direct array input
      if (Array.isArray(users)) {
        if (users.length > 0) {
          setAllUsers(users);
          setVisibleUsers(users.slice(0, config.cardCount));
          setIsDemoData(false);
        }
        return;
      }

      // Case 2: Promise / Thenable
      // 传入 Promise 的情况（异步加载） / Promise input (async loading)
      if (users && typeof (users as any).then === "function") {
        setIsLoadingData(true);
        debugger;
        try {
          const data = await users;
          if (data && Array.isArray(data) && data.length > 0) {
            setAllUsers(data);
            setVisibleUsers(data.slice(0, config.cardCount));
            setIsDemoData(false);
          }
        } catch (err) {
          console.warn("Failed to load users from promise, falling back to demoUsers", err);
          // Fallback to demo data on error
          // 出错时降级使用演示数据
          if (demoUsers && demoUsers.length > 0) {
            setAllUsers(demoUsers);
            setVisibleUsers(demoUsers.slice(0, config.cardCount));
            setIsDemoData(true);
          }
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    handleUsersUpdate();
  }, [users, demoUsers, config.cardCount]);

  // 自动停止逻辑 / Auto Stop Logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
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

    // Reset view, then start next round if requested
    // 重置视角，如果需要则在完成后开始下一轮
    resetView(() => {
      if (autoStart) {
        // Wait 0.2s before starting next round
        // 调整完成后暂停 0.2s 再开始
        setTimeout(() => {
          handleStart(false);
        }, 200);
      }
    });
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

  // 截图 / Screenshot
  // Captures the current canvas state as an image and triggers download.
  // 捕获当前 Canvas 状态为图片并触发下载。
  // Note: Requires preserveDrawingBuffer: true in WebGLRenderer.
  // 注意：需要在 WebGLRenderer 中开启 preserveDrawingBuffer: true。
  const handleScreenshot = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `planet-star-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // 开始录屏 / Start Recording
  // Uses MediaRecorder API to record the canvas stream.
  // 使用 MediaRecorder API 录制 Canvas 流。
  const handleStartRecord = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;

    try {
      // @ts-ignore
      // Capture stream at 30 FPS / 以 30 FPS 捕获流
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      // Collect data chunks / 收集数据块
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      // Handle stop event to save file / 处理停止事件以保存文件
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `planet-star-record-${Date.now()}.webm`;
        link.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Failed to start recording", e);
      alert("录屏启动失败，请检查浏览器兼容性");
    }
  };

  // 停止录屏 / Stop Recording
  const handleStopRecord = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useImperativeHandle(ref, () => ({
    start: handleStart,
    pause: handlePause,
    stop: handleStop,
    resetView: handleResetView,
    toggleFullscreen: toggleFullScreen,
    openSettings: () => setShowSettings(true)
  }));

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
          onScreenshot={handleScreenshot}
          onStartRecord={handleStartRecord}
          onStopRecord={handleStopRecord}
          isRecording={isRecording}
          showBottomControls={showBottomControls}
        />
      </div>

      {/* 结果弹窗 / Result Modal */}
      {state === "RESULT" && currentWinner && (
        <ResultModal winner={currentWinner} autoNextCount={autoNextCount} onClose={handleCloseResult} />
      )}

      {/* 设置弹窗 / Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onSave={handleSaveSettings} />}

      {/* Loading Overlay */}
      {isLoadingData && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Demo Data Warning */}
      {isDemoData && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-6 py-2 rounded-full backdrop-blur-md text-sm font-medium shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            {config.text.msgDemoData}
          </div>
        </div>
      )}
    </div>
  );
});
