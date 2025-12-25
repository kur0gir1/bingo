import React, { useState } from "react";

export default function WinnerNumbers({
  open,
  onClose,
  numbers,
  resetSelected,
}) {
  // Track selected cells for checking
  const [selected, setSelected] = useState(() =>
    Array(15)
      .fill(null)
      .map(() => Array(5).fill(false))
  );

  // Reset selected when resetSelected changes
  React.useEffect(() => {
    setSelected(
      Array(15)
        .fill(null)
        .map(() => Array(5).fill(false))
    );
  }, [resetSelected]);

  if (!open) return null;

  // Helper to get column label (standard bingo)
  const getLabel = (n) => {
    if (n <= 15) return "B";
    if (n <= 30) return "I";
    if (n <= 45) return "N";
    if (n <= 60) return "G";
    return "O";
  };

  // Build columns for a standard bingo card
  const columns = [
    Array.from({ length: 15 }, (_, i) => 1 + i), // B
    Array.from({ length: 15 }, (_, i) => 16 + i), // I
    Array.from({ length: 15 }, (_, i) => 31 + i), // N
    Array.from({ length: 15 }, (_, i) => 46 + i), // G
    Array.from({ length: 15 }, (_, i) => 61 + i), // O
  ];

  const headers = ["B", "I", "N", "G", "O"];

  const handleCellClick = (rowIdx, colIdx) => {
    setSelected((prev) => {
      // Count how many are checked in this column
      const colChecked = prev.reduce(
        (acc, row) => acc + (row[colIdx] ? 1 : 0),
        0
      );
      const alreadyChecked = prev[rowIdx][colIdx];
      // If trying to check (not uncheck) and already 5 checked, do nothing
      if (!alreadyChecked && colChecked >= 5) return prev;
      const updated = prev.map((row) => [...row]);
      updated[rowIdx][colIdx] = !updated[rowIdx][colIdx];
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70">
      <div className="absolute inset-0 bg-neutral-900/95 p-6 flex flex-col items-center overflow-auto">
        <div className="w-full mb-4 flex justify-end">
          <button
            className="inline-flex items-center justify-center p-3 sm:p-4 md:p-5 bg-white/5 hover:bg-white/10 text-white rounded-md text-3xl sm:text-4xl md:text-5xl focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:ring-offset-2"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="w-full mb-3 px-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white text-2xl sm:text-3xl md:text-4xl font-semibold">
              Numbers
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <span className="inline-block w-4 h-4 bg-[#0057D9] rounded-sm border" />
                Drawn
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <span className="inline-block w-4 h-4 bg-neutral-800 rounded-sm border" />
                Not drawn
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <span className="inline-block w-4 h-4 bg-amber-400 rounded-sm border" />
                Selected
              </div>
            </div>
          </div>

          <div className="w-full flex justify-center">
            <table className="border-separate border-spacing-2 w-full h-full table-fixed">
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="text-white text-lg font-bold px-2 pb-2 text-center whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(15)].map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {columns.map((col, colIdx) => {
                      const num = col[rowIdx];
                      const isDrawn = numbers && numbers.includes(num);
                      const isSelected = selected[rowIdx][colIdx];
                      const baseClasses =
                        "w-full h-full flex flex-col items-center justify-center rounded-md font-extrabold shadow-sm cursor-pointer transition-colors duration-150 select-none outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-400";
                      const stateClasses = isDrawn
                        ? "bg-[#0057D9] text-white"
                        : "bg-neutral-800 text-white/90";
                      const selectedClasses = isSelected
                        ? "ring-4 ring-amber-400/60 ring-offset-2"
                        : "";
                      const cellClasses = `${baseClasses} ${stateClasses} ${selectedClasses} hover:brightness-110`;

                      return (
                        <td
                          key={colIdx}
                          className="w-1/5 h-28 sm:h-36 md:h-44 text-center align-middle p-2"
                        >
                          <div
                            className={cellClasses}
                            onClick={() => handleCellClick(rowIdx, colIdx)}
                            tabIndex={0}
                            role="button"
                            aria-pressed={isSelected}
                            aria-label={`${num} ${
                              isDrawn ? "drawn" : "not drawn"
                            } ${isSelected ? "selected" : ""}`}
                          >
                            <span className="text-base sm:text-lg md:text-xl font-semibold text-white/80">
                              {getLabel(num)}
                            </span>
                            <span className="mt-2 text-4xl sm:text-6xl md:text-7xl">
                              {num}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
