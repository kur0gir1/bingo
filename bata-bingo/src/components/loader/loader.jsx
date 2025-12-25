import React, { useEffect, useRef, useState } from "react";

/**
 * Loader
 * Props:
 * - show (bool) : whether to run/visible
 * - from (number) : start number (default 1)
 * - to (number) : end number (default 75)
 * - duration (ms) : total animation duration (default 1500)
 * - onFinish () : called when the animation completes
 */
export default function Loader({
  show = false,
  from = 1,
  to = 75,
  duration = 1500,
  onFinish,
  gradient,
}) {
  const [current, setCurrent] = useState(from);
  const [running, setRunning] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    // start animation
    setRunning(true);
    setCurrent(from);

    const steps = Math.max(1, to - from + 1);
    const intervalMs = Math.max(8, Math.floor(duration / steps));
    let value = from;

    const timer = setInterval(() => {
      value += 1;
      if (!mounted.current) return;
      if (value > to) {
        clearInterval(timer);
        setCurrent(to);
        setRunning(false);
        if (typeof onFinish === "function") onFinish();
        return;
      }
      setCurrent(value);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [show, from, to, duration, onFinish]);

  if (!show && !running) return null;

  const progress = Math.round(((current - from) / (to - from)) * 100);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: gradient ? `${gradient}` : "rgba(0,0,0,0.5)" }}
    >
      <div
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 w-[min(420px,90vw)] text-center shadow-2xl"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }}
      >
        <div className="text-white select-none">
          <div className="text-5xl sm:text-7xl md:text-8xl font-extrabold tabular-nums leading-none transition-transform duration-150">
            <span className="inline-block transform-gpu scale-100">
              {current}
            </span>
          </div>
          <div className="mt-4 text-sm text-white">Switching games…</div>

          <div
            className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden shadow-sm"
            style={{ boxShadow: "inset 0 -2px 6px rgba(0,0,0,0.25)" }}
          >
            <div
              className="h-full transition-[width] duration-150"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: gradient ? gradient : "#eff1e4",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
