import React from "react";
import WinnerNumbers from "./winnerNumbers";
import ConfirmReset from "./ConfirmReset";

export default function NumberGenerator({ config }) {
  // config: { gradient, pattern }
  const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
  const [drawn, setDrawn] = React.useState(() => {
    const stored = localStorage.getItem("bingoDrawnNumbers");
    return stored ? JSON.parse(stored) : [];
  });
  const [last, setLast] = React.useState(() => {
    const stored = localStorage.getItem("bingoLastNumber");
    return stored ? JSON.parse(stored) : null;
  });
  const [showWinnerModal, setShowWinnerModal] = React.useState(false);
  const [resetSelected, setResetSelected] = React.useState(0);

  React.useEffect(() => {
    localStorage.setItem("bingoDrawnNumbers", JSON.stringify(drawn));
    localStorage.setItem("bingoLastNumber", JSON.stringify(last));
  }, [drawn, last]);

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

  const [showConfirm, setShowConfirm] = React.useState(false);

  const doReset = () => {
    setDrawn([]);
    setLast(null);
    localStorage.removeItem("bingoDrawnNumbers");
    localStorage.removeItem("bingoLastNumber");
    setResetSelected((c) => c + 1);
    setShowConfirm(false);
  };

  const getLabel = (n) => {
    if (n <= 15) return "B";
    if (n <= 30) return "I";
    if (n <= 45) return "N";
    if (n <= 60) return "G";
    return "O";
  };

  const previousDraws = drawn.length > 1 ? drawn.slice(-6, -1) : [];

  const extractPrimaryColor = (gradient) => {
    if (!gradient) return "#ffffff";
    const m = gradient.match(/#([0-9A-Fa-f]{3,6})/);
    return m ? `#${m[1]}` : "#ffffff";
  };

  const renderPatternPreview = () => {
    const grid = config.patternGrid || defaultGridFor(config.pattern);
    const color = extractPrimaryColor(config.gradient);
    return (
      <div>
        <div className="grid grid-cols-5 gap-1 bg-black p-2 rounded-xl w-full h-full">
          {grid.map((row, r) =>
            row.map((on, c) => (
              <div
                key={`${r}-${c}`}
                className="aspect-square w-full flex items-center justify-center rounded-md"
                style={
                  on
                    ? {
                        background: color,
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
                      }
                    : {
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }
                }
              />
            ))
          )}
        </div>
      </div>
    );
  };

  const makeGrid = (fill = false) =>
    Array.from({ length: 5 }, () => Array(5).fill(fill));
  const defaultGridFor = (pattern) => {
    const g = makeGrid(false);
    switch ((pattern || "").toLowerCase()) {
      case "diamond":
        // diamond outline only: cells with Manhattan distance exactly 2 from center
        for (let r = 0; r < 5; r++)
          for (let c = 0; c < 5; c++)
            if (Math.abs(r - 2) + Math.abs(c - 2) === 2) g[r][c] = true;
        return g;
      case "cross":
        // 'cross' as an X: both diagonals
        for (let i = 0; i < 5; i++) {
          g[i][i] = true;
          g[i][4 - i] = true;
        }
        return g;
      case "outside":
        for (let r = 0; r < 5; r++)
          for (let c = 0; c < 5; c++)
            if (r === 0 || r === 4 || c === 0 || c === 4) g[r][c] = true;
        return g;
      case "diagonal":
        // bottom-right triangle (opposite side): cells where r + c >= 4
        for (let r = 0; r < 5; r++)
          for (let c = 0; c < 5; c++) if (r + c >= 4) g[r][c] = true;
        return g;
      case "blackout":
        return makeGrid(true);
      default:
        return g;
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto h-full justify-center px-2">
      <div className="text-l text-white py-2">
        LA CONSOLACION COLLEGE BACOLOD ALUMNI ASSOCIATION
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
        BINGO SOCIAL
      </div>
      <div className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-6 mt-1 sm:mt-2 tracking-wide text-center">
        PREVIOUS DRAWS:
      </div>
      <div className="flex items-start justify-center gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-8 min-h-[4.5rem] sm:min-h-[6rem] w-full">
        {previousDraws.map((n, i) => (
          <div
            key={i}
            className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center text-white text-2xl sm:text-4xl md:text-5xl font-bold shadow-2xl"
            style={{
              background: config.gradient,
            }}
          >
            <span className="text-2xl sm:text-4xl md:text-5xl font-bold">
              {getLabel(n)} {n}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center mb-6 sm:mb-12 w-full gap-4">
        {/* Pattern: ~30% of viewport width on desktop, stacked on mobile */}
        <div
          className="flex-shrink-0 flex items-center justify-center md:justify-start"
          style={{ width: "100%", maxWidth: "720px" }}
        >
          <div
            style={{
              width: "36vw",
              maxWidth: "380px",
              minWidth: "140px",
              marginLeft: "-6rem",
            }}
          >
            {renderPatternPreview()}
          </div>
        </div>
        {/* Number area: takes remaining space (approx 70% of viewport) */}
        <div
          className="flex-1 flex items-center justify-center"
          style={{ minWidth: 0 }}
        >
          {last ? (
            <div
              className="flex flex-row items-end gap-4 sm:gap-8 w-full justify-center"
              style={{ transform: "translateX(-2rem)" }}
            >
              <span className="tabular-nums text-white text-[6.25rem] sm:text-[11.25rem] md:text-[15.25rem] font-extrabold leading-none drop-shadow-2xl">
                {getLabel(last)}
              </span>
              <span className="tabular-nums text-white text-[6.25rem] sm:text-[11.25rem] md:text-[15.25rem] font-extrabold leading-none drop-shadow-2xl">
                {last}
              </span>
            </div>
          ) : (
            <div className="text-white text-3xl sm:text-5xl font-bold text-center">
              Press START GAME to start
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 mt-1 sm:mt-2 w-full justify-center items-center">
        <button
          className="px-6 py-4 sm:px-12 sm:py-6 text-white rounded-2xl font-bold text-xl sm:text-2xl shadow-2xl transition disabled:opacity-50 border-none w-full sm:w-auto"
          style={{
            background: config.gradient,
            boxShadow: "0 4px 16px 0 rgba(0,0,0,0.25)",
            border: "none",
          }}
          onClick={handleDraw}
          disabled={drawn.length === 75}
        >
          {drawn.length === 0 ? "START GAME" : "NEXT NUMBER"}
        </button>
        <button
          className="px-6 py-4 sm:px-12 sm:py-6 text-white rounded-2xl font-bold text-xl sm:text-2xl shadow-2xl transition border-none w-full sm:w-auto"
          style={{
            background: config.gradient,
            boxShadow: "0 4px 16px 0 rgba(0,0,0,0.25)",
            border: "none",
          }}
          onClick={() => setShowWinnerModal(true)}
        >
          DO WE HAVE A WINNER?
        </button>
        <button
          className="px-6 py-4 sm:px-12 sm:py-6 text-white rounded-2xl font-bold text-xl sm:text-2xl shadow-2xl transition border-none w-full sm:w-auto bg-red-700 hover:bg-red-800"
          onClick={() => setShowConfirm(true)}
        >
          RESET
        </button>
      </div>

      <WinnerNumbers
        open={showWinnerModal}
        onClose={() => setShowWinnerModal(false)}
        numbers={drawn}
        resetSelected={resetSelected}
        color={extractPrimaryColor(config.gradient)}
      />
      <ConfirmReset
        open={showConfirm}
        onConfirm={doReset}
        onCancel={() => setShowConfirm(false)}
        gradient={config.gradient}
      />
    </div>
  );
}