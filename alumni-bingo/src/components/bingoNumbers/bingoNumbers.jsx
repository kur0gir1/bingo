import React, { useState, useEffect } from "react";
import WinnerNumbers from "./winnerNumbers";

export default function BingoNumbers() {
  const [resetSelected, setResetSelected] = useState(0);
  // Flat array of all numbers
  const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
  // Load from localStorage if available
  const [drawn, setDrawn] = useState(() => {
    const stored = localStorage.getItem("bingoDrawnNumbers");
    return stored ? JSON.parse(stored) : [];
  });
  const [last, setLast] = useState(() => {
    const stored = localStorage.getItem("bingoLastNumber");
    return stored ? JSON.parse(stored) : null;
  });
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // Draw a new number
  const handleDraw = () => {
    const remaining = allNumbers.filter((n) => !drawn.includes(n));
    if (remaining.length === 0) return;
    const idx = Math.floor(Math.random() * remaining.length);
    const num = remaining[idx];
    setDrawn((prev) => {
      const updated = [...prev, num];
      localStorage.setItem("bingoDrawnNumbers", JSON.stringify(updated));
      return updated;
    });
    setLast(() => {
      localStorage.setItem("bingoLastNumber", JSON.stringify(num));
      return num;
    });
  };

  // Reset drawn numbers and localStorage
  const handleReset = () => {
    setDrawn([]);
    setLast(null);
    localStorage.removeItem("bingoDrawnNumbers");
    localStorage.removeItem("bingoLastNumber");
    setResetSelected((c) => c + 1);
  };

  // Sync state to localStorage on mount (in case of manual edits)
  useEffect(() => {
    localStorage.setItem("bingoDrawnNumbers", JSON.stringify(drawn));
    localStorage.setItem("bingoLastNumber", JSON.stringify(last));
  }, [drawn, last]);

  // Helper to get column label
  const getLabel = (n) => {
    if (n <= 15) return "B";
    if (n <= 30) return "I";
    if (n <= 45) return "N";
    if (n <= 60) return "G";
    return "O";
  };

  // Get last 5 draws before the current (oldest to newest, not including current)
  const previousDraws = drawn.length > 1 ? drawn.slice(-6, -1) : [];

  return (
    <div
      className="flex items-center justify-center bg-blue-400"
      style={{ width: "100vw", height: "100vh" }}
    >
      <div className="flex flex-col items-center w-full max-w-5xl mx-auto h-full justify-center px-2">
        <div className="text-l text-white py-4">LA CONSOLACION COLLEGE BACOLOD ALUMNI ASSOCIATION</div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">BINGO SOCIAL</div>
        <div className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-10 mt-4 sm:mt-8 tracking-wide text-center">
          PREVIOUS DRAWS:
        </div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-12 mb-8 sm:mb-16 min-h-[6rem] sm:min-h-[8rem] w-full">
          {previousDraws.map((n, i) => (
            <div
              key={i}
              className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center text-white text-2xl sm:text-4xl md:text-5xl font-bold shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #24B6FF 0%, #1C06EA 100%)",
              }}
            >
              <span className="text-2xl sm:text-4xl md:text-5xl font-bold">
                {getLabel(n)} {n}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center mb-10 sm:mb-20 w-full">
          {last ? (
            <div className="flex flex-row items-end gap-4 sm:gap-8 w-full justify-center">
              <span className="text-white text-[5rem] sm:text-[10rem] md:text-[14rem] font-extrabold leading-none drop-shadow-2xl">
                {getLabel(last)}
              </span>
              <span className="text-white text-[5rem] sm:text-[10rem] md:text-[14rem] font-extrabold leading-none drop-shadow-2xl">
                {last}
              </span>
            </div>
          ) : (
            <div className="text-blue-700 text-3xl sm:text-5xl font-bold text-center">
              Press NEXT NUMBER to start
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 mt-2 sm:mt-4 w-full justify-center items-center">
          <button
            className="px-6 py-4 sm:px-12 sm:py-6 text-white rounded-2xl font-bold text-xl sm:text-2xl shadow-2xl transition disabled:opacity-50 border-none w-full sm:w-auto"
            style={{
              background: "linear-gradient(45deg, #24B6FF 0%, #1C06EA 100%)",
              boxShadow: "0 8px 32px 0 rgba(34,10,255,0.25)",
              border: "none",
            }}
            onClick={handleDraw}
            disabled={drawn.length === 75}
          >
            NEXT NUMBER
          </button>
          <button
            className="px-6 py-4 sm:px-12 sm:py-6 text-white rounded-2xl font-bold text-xl sm:text-2xl shadow-2xl transition border-none w-full sm:w-auto"
            style={{
              background: "linear-gradient(45deg, #24B6FF 0%, #1C06EA  100%)",
              boxShadow: "0 8px 32px 0 rgba(34,10,255,0.25)",
              border: "none",
            }}
            onClick={() => setShowWinnerModal(true)}
          >
            DO WE HAVE A WINNER?
          </button>
          <button
            className="px-6 py-4 sm:px-12 sm:py-6 text-white rounded-2xl font-bold text-xl sm:text-2xl shadow-2xl transition border-none w-full sm:w-auto bg-red-700 hover:bg-red-800"
            onClick={handleReset}
          >
            RESET
          </button>
        </div>
        <WinnerNumbers
          open={showWinnerModal}
          onClose={() => setShowWinnerModal(false)}
          numbers={drawn}
          resetSelected={resetSelected}
        />
      </div>
    </div>
  );
}
