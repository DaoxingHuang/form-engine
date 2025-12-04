import { useEffect, useRef, useState } from "react";
import { usePlanetMapScene } from "./usePlanetMapScene";
import { generateUsers, usePlanetMapStore } from "./usePlanetMapStore";

export default function PlanetMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [autoRemaining, setAutoRemaining] = useState<number | null>(null);

  // Modal animation state
  const [modalClasses, setModalClasses] = useState("transform scale-0 opacity-0");
  const [modalVisible, setModalVisible] = useState(false); // controls 'hidden' class

  // Timers
  const autoTimeoutRef = useRef<number | null>(null);
  const autoIntervalRef = useRef<number | null>(null);
  const swapIntervalRef = useRef<number | null>(null);

  const CONFIG = {
    totalUsers: 2000,
    cardCount: 200,
    swapInterval: 6000,
    autoNextRoundDelay: 5000
  };

  const { allUsers, setAllUsers, setVisibleUsers, rotateUsers, state, setState, winners, setWinners } =
    usePlanetMapStore();

  // Init users
  useEffect(() => {
    if (allUsers.length === 0) {
      const users = generateUsers(CONFIG.totalUsers);
      setAllUsers(users);
      setVisibleUsers(users.slice(0, CONFIG.cardCount));
    }
  }, [allUsers, setAllUsers, setVisibleUsers]);

  // Scene Hook
  const scene = usePlanetMapScene(containerRef);

  // Swap Logic
  useEffect(() => {
    const startSwapping = () => {
      if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
      swapIntervalRef.current = window.setInterval(() => {
        if (usePlanetMapStore.getState().state !== "STOPPING" && usePlanetMapStore.getState().state !== "RESULT") {
          rotateUsers(CONFIG.cardCount);
        }
      }, CONFIG.swapInterval);
    };

    startSwapping();
    return () => {
      if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
    };
  }, [rotateUsers]);

  // Handlers
  const handleStart = () => {
    if (state === "IDLE") {
      setState("COUNTDOWN");
      // Countdown UI logic
      let count = 3;
      const el = document.getElementById("pm-countdown");
      if (el) {
        el.classList.remove("hidden");
        el.textContent = String(count);
        // Reset animation
        el.classList.remove("countdown-anim");
        void el.offsetWidth; // trigger reflow
        el.classList.add("countdown-anim");
      }
      const t = setInterval(() => {
        count--;
        if (el) {
          el.textContent = String(count);
          el.classList.remove("countdown-anim");
          void el.offsetWidth;
          el.classList.add("countdown-anim");
        }
        if (count <= 0) {
          clearInterval(t);
          if (el) el.classList.add("hidden");
          setState("SPINNING");
        }
      }, 800);
    }
  };

  const handlePauseToggle = () => {
    if (state === "SPINNING") {
      setState("PAUSED");
    } else if (state === "PAUSED") {
      setState("SPINNING");
    }
  };

  const handleStop = () => {
    if (state === "SPINNING" || state === "PAUSED") {
      setState("STOPPING");
      scene.stopLottery((winner) => {
        setWinners([winner]);
        showResultModal();
      });
    }
  };

  const handleResetView = () => {
    scene.resetCamera();
  };

  // Modal Logic
  const showResultModal = () => {
    setState("RESULT");
    setModalVisible(true); // remove hidden

    // Initial state
    setModalClasses("transform scale-0 opacity-0");

    // Animate in
    setTimeout(() => {
      setModalClasses("modal-enter-bounce scale-100");
    }, 50);

    startAutoNextCountdown();
  };

  const closeResult = (autoStart: boolean) => {
    // Animate out
    setModalClasses("transform scale-0 opacity-0 transition-all duration-300 ease-out");

    if (autoTimeoutRef.current) clearTimeout(autoTimeoutRef.current);
    if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    setAutoRemaining(null);

    setTimeout(() => {
      setModalVisible(false); // add hidden
      setModalClasses("transform scale-0 opacity-0"); // reset

      scene.resetCamera();
      setState("IDLE");

      if (autoStart) {
        handleStart();
      }
    }, 300);
  };

  const startAutoNextCountdown = () => {
    if (autoTimeoutRef.current) clearTimeout(autoTimeoutRef.current);
    if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);

    let remaining = CONFIG.autoNextRoundDelay / 1000;
    setAutoRemaining(remaining);

    autoIntervalRef.current = window.setInterval(() => {
      remaining--;
      setAutoRemaining(remaining >= 0 ? remaining : 0);
      if (remaining < 0) {
        if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
      }
    }, 1000);

    autoTimeoutRef.current = window.setTimeout(() => {
      handleManualStartNextRound();
    }, CONFIG.autoNextRoundDelay);
  };

  const handleManualStartNextRound = () => {
    closeResult(true);
  };

  const handleManualClose = () => {
    closeResult(false);
  };

  // Helper for status
  const getStatusInfo = () => {
    switch (state) {
      case "IDLE":
        return { text: "READY", color: "bg-green-500" };
      case "COUNTDOWN":
        return { text: "PREPARING", color: "bg-yellow-500" };
      case "SPINNING":
        return { text: "SPINNING...", color: "bg-blue-500" };
      case "PAUSED":
        return { text: "PAUSED", color: "bg-yellow-500" };
      case "STOPPING":
        return { text: "LUCKY WINNER...", color: "bg-purple-500" };
      case "RESULT":
        return { text: "WINNER FOUND!", color: "bg-green-500" };
      default:
        return { text: "READY", color: "bg-green-500" };
    }
  };

  const statusInfo = getStatusInfo();
  const winner = winners[0];

  return (
    <div className="relative w-screen h-screen bg-[#050510] text-white font-sans overflow-hidden">
      {/* 3D Container */}
      <div ref={containerRef} id="canvas-container" className="absolute inset-0 z-0" />

      {/* UI Layer */}
      <div id="ui-layer" className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        {/* Top Bar: Status */}
        <div className="flex justify-between items-start">
          <div className="glass-panel p-4 rounded-xl text-white pointer-events-auto">
            <h1 className="text-2xl font-bold ribbon-text">LOTTERY PLANET</h1>
            <div className="text-xs text-gray-400 mt-1">
              4周年庆典版 | 参与人数: <span className="text-cyan-300">{allUsers.length}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${statusInfo.color}`}></div>
              <span className="text-sm font-mono text-gray-300">{statusInfo.text}</span>
            </div>
          </div>

          <div className="glass-panel p-2 rounded-lg flex gap-2 pointer-events-auto">
            <button className="p-2 hover:bg-white/10 rounded text-gray-300 text-xs" title="设置">
              ⚙️
            </button>
            <button
              className="p-2 hover:bg-white/10 rounded text-gray-300 text-xs"
              title="全屏"
              onClick={() => {
                if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
              }}
            >
              ⛶
            </button>
          </div>
        </div>

        {/* Center: Countdown */}
        <div
          id="pm-countdown"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-black text-white hidden z-50 neon-text"
        >
          3
        </div>

        {/* Bottom: Control Bar */}
        <div className="flex justify-center items-end pb-8">
          <div className="glass-panel px-6 py-4 rounded-full flex gap-4 pointer-events-auto items-center">
            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={state === "COUNTDOWN"}
              className={`bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform flex items-center gap-2 border border-white/20 ${
                state === "IDLE"
                  ? "hover:from-pink-400 hover:via-purple-400 hover:to-cyan-400 hover:scale-105 active:scale-95"
                  : "cursor-wait opacity-90"
              } ${state !== "IDLE" && state !== "COUNTDOWN" ? "hidden" : ""}`}
            >
              {state === "COUNTDOWN" ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>启动中...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">✨</span> 开启好运 (自动轮训)
                </>
              )}
            </button>

            {/* Pause Button */}
            <button
              onClick={handlePauseToggle}
              className={`bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full shadow transition ${state === "SPINNING" || state === "PAUSED" ? "" : "hidden"}`}
            >
              {state === "PAUSED" ? "▶ 继续" : "⏸ 暂停"}
            </button>

            {/* Stop Button */}
            <button
              onClick={handleStop}
              className={`bg-red-600/80 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-full shadow transition border border-red-400/30 ${state === "SPINNING" || state === "PAUSED" ? "" : "hidden"}`}
            >
              ⏹ 停止 & 开奖
            </button>

            <div className="w-px h-8 bg-gray-600 mx-2"></div>
            <button onClick={handleResetView} className="text-gray-400 hover:text-white text-sm">
              重置视角
            </button>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <div
        className={`fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm ${modalVisible ? "" : "hidden"}`}
      >
        <div className={`anniversary-card max-w-md w-full mx-4 ${modalClasses}`}>
          <div className="card-inner p-8 relative overflow-hidden">
            {/* Deco Number */}
            <div className="bg-deco-number">4</div>

            {/* Header */}
            <div className="text-center mb-6 z-10 relative">
              <div className="inline-block px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs tracking-widest mb-2">
                ANNIVERSARY
              </div>
              <h2 className="text-4xl font-black ribbon-text tracking-tight">恭喜中奖!</h2>
              <p className="text-gray-400 text-sm mt-1">LUCKY WINNER</p>
            </div>

            {/* Avatar */}
            <div className="relative flex justify-center mb-6 z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full blur-xl opacity-40 animate-pulse w-32 h-32 mx-auto top-[-10px]"></div>
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-yellow-300 via-pink-500 to-cyan-400">
                <img
                  src={
                    winner
                      ? "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjMwIiByPSIyMCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPjxwYXRoIGQ9Ik0yMCA5MCBRNTAgNTAgODAgOTAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz48L3N2ZyUzRQ=="
                      : ""
                  }
                  style={{ backgroundColor: winner?.avatarColor }}
                  className="w-28 h-28 rounded-full border-4 border-[#0f1016] object-cover bg-gray-800"
                  alt="Winner Avatar"
                />
              </div>
            </div>

            {/* Winner Info */}
            <div className="text-center mb-8 z-10 relative">
              <h3 className="text-3xl text-white font-bold mb-1 drop-shadow-md">{winner?.name ?? "Unknown"}</h3>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 font-mono">
                ID: {winner?.id ?? "N/A"} | {winner?.dept ?? ""}
              </p>
            </div>

            {/* Prize */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 relative z-10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎁</div>
                <div className="text-left">
                  <p className="text-gray-400 text-xs uppercase">Prize</p>
                  <p className="text-lg font-bold text-white leading-tight">4周年限定神秘大礼包</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <button className="btn-auto-next border border-white/20 text-gray-300 py-3 rounded-xl transition text-sm font-medium cursor-default">
                <span>{typeof autoRemaining === "number" ? `${autoRemaining}秒后自动开始下一轮` : "等待中..."}</span>
              </button>
              <button
                onClick={handleManualStartNextRound}
                className="btn-gradient-theme text-white py-3 rounded-xl transition font-bold shadow-lg flex justify-center items-center gap-2 text-sm"
              >
                <span className="text-lg">▶️</span> 立即开始下一轮
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleManualClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white z-20 transition transform hover:rotate-90"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
