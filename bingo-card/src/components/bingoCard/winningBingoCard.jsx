import React from "react";

export default function WinningBingoCard({ open, onClose, headers, columns, selected }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-blue-900 rounded-xl shadow-lg p-8 max-w-2xl w-full relative border-4 border-blue-700 flex flex-col items-center justify-center">
        <button
          className="absolute top-2 right-2 text-blue-200 hover:text-blue-400 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <div className="flex flex-col items-center w-full">
          <h2 className="text-2xl font-bold text-blue-400 mb-2 text-center">Congratulations!</h2>
          <p className="mb-4 text-blue-200 text-center">Blackout! You win!</p>
          <div className="flex justify-center w-full mb-2">
            <div className="grid grid-cols-5 gap-2">
              {headers.map((h) => (
                <div key={h} className="text-center font-bold text-base text-blue-200 bg-black py-1 rounded border-b-2 border-blue-700">
                  {h}
                </div>
              ))}
              {[0, 1, 2, 3, 4].flatMap((rowIdx) =>
                columns && columns.map((col, colIdx) => {
                  const isFree = colIdx === 2 && rowIdx === 2;
                  const isSelected = (colIdx === 2 && rowIdx === 2) || (selected && selected[rowIdx][colIdx]);
                  return (
                    <div
                      key={colIdx + "-" + rowIdx + "-modal"}
                      className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center text-base sm:text-xl md:text-2xl font-bold rounded border-2
                        ${isFree ? "bg-blue-800 text-blue-200 border-blue-800" : ""}
                        ${isSelected ? "bg-blue-700 text-blue-100 border-blue-400" : "bg-black text-blue-300 border-blue-900"}
                      `}
                    >
                      {col[rowIdx]}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <button
            className="mt-2 px-4 py-2 bg-blue-700 text-blue-100 rounded hover:bg-blue-800 transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
