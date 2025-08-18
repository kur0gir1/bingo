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

  // Helper to get column label
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#0a0a23] rounded-2xl shadow-2xl p-8 max-w-3xl w-full flex flex-col items-center relative max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <button
          className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-blue-400 focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Drawn Numbers
        </h2>
        <div className="w-full flex justify-center">
          <table className="border-separate border-spacing-2 w-full">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="text-white text-2xl sm:text-3xl md:text-4xl font-bold px-2 pb-2 text-center whitespace-nowrap"
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
                    return (
                      <td
                        key={colIdx}
                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-center align-middle p-0"
                      >
                        <div
                          className={`w-full h-full flex items-center justify-center rounded-lg font-extrabold shadow text-xl sm:text-3xl md:text-4xl cursor-pointer transition select-none ${
                            isDrawn
                              ? "bg-gradient-to-b from-blue-900 to-blue-700 text-white"
                              : "bg-gray-800 text-gray-600"
                          } ${
                            isSelected
                              ? "ring-4 ring-blue-700 ring-offset-2"
                              : ""
                          }`}
                          onClick={() => handleCellClick(rowIdx, colIdx)}
                          tabIndex={0}
                          role="button"
                          aria-pressed={isSelected}
                        >
                          {getLabel(num)} {num}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center text-blue-200 text-base">
          Tap or click cells to mark them for easy checking!
        </div>
      </div>
    </div>
  );
}
