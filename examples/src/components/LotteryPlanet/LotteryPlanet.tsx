import { useEffect, useRef, useState } from "react";
import ControlBar from "./ControlBar";
import ResultModal from "./ResultModal";
import StatusPanel from "./StatusPanel";
import { generateUsers, useLotteryStore } from "./useLotteryStore";
import { usePlanetScene } from "./usePlanetScene";

/**
 * LotteryPlanet - parent component that composes the Three hook and UI pieces
 * 将 Three.js 逻辑委托给 usePlanetScene，并把 UI 拆为小组件（中/英注释）
 */
export default function LotteryPlanet() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [autoRemaining, setAutoRemaining] = useState<number | null>(null);
  const autoTimeoutRef = useRef<number | null>(null);
  const autoIntervalRef = useRef<number | null>(null);
  const AUTO_DELAY = 5000; // ms, matches starsnew.html

  const { users, setUsers, state, setState, winners } = useLotteryStore();

  // mount demo users (可替换为真实数据源)
  useEffect(() => {
    if (!users || users.length === 0) setUsers(generateUsers(200));
  }, [setUsers, users]);

  // initialize scene hook
  const scene = usePlanetScene(containerRef);

  // whenever users are available, populate cards lazily
  useEffect(() => {
    if (users && users.length > 0) {
      scene.populateCards({ cardCount: users.length, radius: 600 });
    }
  }, [users, scene]);

  // handlers wired to UI
  function handleStart() {
    setState("COUNTDOWN");
    // simple 3..2..1 countdown then spin
    let count = 3;
    const el = document.getElementById("lp-countdown");
    if (el) {
      el.classList.remove("hidden");
      el.textContent = String(count);
    }
    const t = setInterval(() => {
      count--;
      if (el) el.textContent = String(count);
      if (count <= 0) {
        clearInterval(t);
        if (el) el.classList.add("hidden");
        setState("SPINNING");
        scene.startSpin();
      }
    }, 800);
  }

  function handleStop() {
    setState("STOPPING");
    scene.stopSpin();
    const selected = scene.selectAndFocus(1);
    if (selected && selected.length > 0) {
      setTimeout(() => {
        setModalOpen(true);
        setState("RESULT");

        // start auto-next countdown
        // clear any previous timers
        if (autoTimeoutRef.current) window.clearTimeout(autoTimeoutRef.current);
        if (autoIntervalRef.current) window.clearInterval(autoIntervalRef.current);

        let remaining = AUTO_DELAY / 1000;
        setAutoRemaining(remaining);
        autoIntervalRef.current = window.setInterval(() => {
          remaining -= 1;
          setAutoRemaining(remaining >= 0 ? remaining : 0);
          if (remaining < 0) {
            if (autoIntervalRef.current) window.clearInterval(autoIntervalRef.current);
          }
        }, 1000);

        autoTimeoutRef.current = window.setTimeout(() => {
          // auto start next round
          handleManualStartNextRound();
        }, AUTO_DELAY);
      }, 2200);
    }
  }

  function handleResetView() {
    scene.resetCamera();
  }

  function handleCloseModal() {
    // default close (manual close without auto start)
    // clear timers
    if (autoTimeoutRef.current) window.clearTimeout(autoTimeoutRef.current);
    if (autoIntervalRef.current) window.clearInterval(autoIntervalRef.current);
    setAutoRemaining(null);
    setModalOpen(false);
    // reset for next round
    scene.resetCamera();
    setState("IDLE");
  }

  function handleManualStartNextRound() {
    // triggered by manual "start next" or auto timeout
    if (autoTimeoutRef.current) window.clearTimeout(autoTimeoutRef.current);
    if (autoIntervalRef.current) window.clearInterval(autoIntervalRef.current);
    setAutoRemaining(null);
    setModalOpen(false);
    // reset card visuals before starting
    scene.resetCamera();
    setState("COUNTDOWN");
    // trigger the same start countdown as handleStart
    let count = 3;
    const el = document.getElementById("lp-countdown");
    if (el) {
      el.classList.remove("hidden");
      el.textContent = String(count);
    }
    const t = window.setInterval(() => {
      count--;
      if (el) el.textContent = String(count);
      if (count <= 0) {
        clearInterval(t);
        if (el) el.classList.add("hidden");
        setState("SPINNING");
        scene.startSpin();
      }
    }, 800);
  }

  return (
    <div className="relative w-screen h-screen bg-[#050510] text-white">
      <div ref={containerRef} id="canvas-container" className="absolute inset-0" />

      <div id="ui-layer" className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start pointer-events-auto">
          <StatusPanel count={users.length} stateLabel={state} />
          <div className="glass-panel p-2 rounded-lg flex gap-2 pointer-events-auto">
            <button className="p-2 hover:bg-white/10 rounded text-gray-300 text-xs">⚙️</button>
            <button
              className="p-2 hover:bg-white/10 rounded text-gray-300 text-xs"
              onClick={() => {
                if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
              }}
            >
              ⛶
            </button>
          </div>
        </div>

        <div
          id="lp-countdown"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-black hidden neon-text"
        >
          3
        </div>

        <div className="flex justify-center items-end pb-8 pointer-events-auto">
          <ControlBar
            onStart={handleStart}
            onPauseToggle={() => {
              state === "SPINNING" ? setState("PAUSED") : setState("SPINNING");
            }}
            onStop={handleStop}
            onResetView={handleResetView}
          />
        </div>
      </div>

      <ResultModal
        open={modalOpen}
        winners={winners}
        autoRemaining={autoRemaining ?? undefined}
        onManualStart={handleManualStartNextRound}
        onManualClose={handleCloseModal}
      />
    </div>
  );
}
