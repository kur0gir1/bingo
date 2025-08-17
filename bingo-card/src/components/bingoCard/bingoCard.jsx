import React, { useState, useMemo } from "react";

function columnNumbers(start, end, count) {
  const numbers = [];
  while (numbers.length < count) {
    const n = Math.floor(Math.random() * (end - start + 1)) + start;

    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers;
}

export default function BingoCard() {
  const columns = useMemo(
    () => [
      columnNumbers(1, 15, 5),
      columnNumbers(16, 30, 5),
      columnNumbers(31, 45, 5),
      columnNumbers(46, 60, 5),
      columnNumbers(61, 75, 5),
    ],
    []
  );

  columns[2][2] = "FREE";

  const headers = ["B", "I", "N", "G", "O"];

  const [selected, setSelected] = useState(new Set());
 
  const handleCellClick = (rowIdx, colIdx) => {
    if (colIdx === 2 && rowIdx === 2) return;
    setSelected((prev) => {
      const next = new Set(prev);
      const key = `${rowIdx} - ${colIdx}`;
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <>
      <div className="bingoCard flex justify-center items-center min-h-screen bg-black">
        <div className="grid grid-cols-5 gap-2">
          {headers.map((h, i) => (
            <div
              key={h}
              className={`text-white text-center text-lg font-bold py-2 ${i === 0 ? "rounded-tl-xl" : ""} ${i === 4 ? "rounded-tr-xl" : ""}`}
            >
              {h}
            </div>
          ))}
          {[0, 1, 2, 3, 4].flatMap((rowIdx) =>
            columns.map((col, colIdx) => {
              const isFree = colIdx === 2 && rowIdx === 2;
              const key = `${rowIdx} - ${colIdx}`;
              const isSelected = selected.has(key);

              // Rounded corners for the four corners of the grid
              let rounded = "";
              if (rowIdx === 0 && colIdx === 0) rounded = "rounded-tl-xl";
              if (rowIdx === 0 && colIdx === 4) rounded = "rounded-tr-xl";
              if (rowIdx === 4 && colIdx === 0) rounded = "rounded-bl-xl";
              if (rowIdx === 4 && colIdx === 4) rounded = "rounded-br-xl";

              return (
                <div
                  key={colIdx + "-" + rowIdx}
                  className={`
                    w-16 h-16 flex items-center justify-center text-xl font-bold cursor-pointer select-none transition
                    border-2 border-white bg-black
                    ${isFree ? "bg-gray-400 text-gray-700 cursor-default" : ""}
                    ${isSelected ? "bg-gray-400 text-gray-700" : "text-white hover:bg-gray-800"}
                    ${rounded}
                  `}
                  onClick={() => handleCellClick(rowIdx, colIdx)}
                  style={{
                    pointerEvents: isFree ? "none" : "auto",
                  }}
                >
                  {col[rowIdx]}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
