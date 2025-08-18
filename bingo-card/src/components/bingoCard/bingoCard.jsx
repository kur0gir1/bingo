import React, { useState, useEffect, useCallback } from "react";
import WinningBingoCard from "./winningBingoCard";

// BingoHeader: renders a single header cell
function BingoHeader({ label, isFirst, isLast }) {
  return (
    <div
      className={`text-blue-300 text-center text-2xl font-bold py-4 bg-black border-b-4 border-blue-700 ${isFirst ? "rounded-tl-xl" : ""} ${isLast ? "rounded-tr-xl" : ""}`}
    >
      {label}
    </div>
  );
}

// BingoCell: renders a single bingo cell
function BingoCell({ value, isSelected, isFree, rounded, onClick, onKeyDown }) {
  return (
    <div
      className={`
        w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold cursor-pointer select-none transition
        border-2 border-blue-700 bg-black
        ${isFree ? "bg-blue-800 text-blue-200 cursor-default border-blue-800" : ""}
        ${isSelected ? "bg-blue-700 text-blue-100 border-blue-400" : "text-blue-300 hover:bg-blue-900"}
        ${rounded}
      `}
      onClick={onClick}
      onTouchStart={onClick}
      tabIndex={0}
      role="gridcell"
      aria-selected={isSelected}
      style={{
        pointerEvents: isFree ? "none" : "auto",
        userSelect: "none",
        outline: isSelected ? "2px solid #3b82f6" : "none",
        transition: "background 0.2s, outline 0.2s"
      }}
      onKeyDown={onKeyDown}
    >
      {value}
    </div>
  );
}


function columnNumbers(start, end, count) {
  const numbers = [];
  while (numbers.length < count) {
    const n = Math.floor(Math.random() * (end - start + 1)) + start;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers;
}

export default function BingoCard() {
  // Card count state (max 2)
  const [cardCount, setCardCount] = useState(() => {
    const stored = localStorage.getItem("bingoCardCount");
    return stored ? Math.min(Number(stored), 2) : 1;
  });

  // Card keys for localStorage
  const getCardKey = idx => `bingoCardNumbers_${idx}`;
  const getSelectedKey = idx => `bingoCardSelected_${idx}`;

  // Generate card numbers
  const getInitialColumns = idx => {
    const CARD_KEY = getCardKey(idx);
    const stored = localStorage.getItem(CARD_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 5) return parsed;
      } catch { /* ignore parse error */ }
    }
    const generated = [
      columnNumbers(1, 15, 5),
      columnNumbers(16, 30, 5),
      columnNumbers(31, 45, 5),
      columnNumbers(46, 60, 5),
      columnNumbers(61, 75, 5),
    ];
    generated[2][2] = "FREE";
    localStorage.setItem(CARD_KEY, JSON.stringify(generated));
    return generated;
  };

  // Generate selected state
  const getInitialSelected = idx => {
    const SELECTED_KEY = getSelectedKey(idx);
    const stored = localStorage.getItem(SELECTED_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 5) return parsed;
      } catch { /* ignore parse error */ }
    }
    // Free space is always selected
    return Array(5).fill(null).map((row, i) => Array(5).fill(false).map((cell, j) => i === 2 && j === 2));
  };


  // State for each card
  const [columnsArr, setColumnsArr] = useState(() => [getInitialColumns(0), cardCount === 2 ? getInitialColumns(1) : null]);
  const [selectedArr, setSelectedArr] = useState(() => [getInitialSelected(0), cardCount === 2 ? getInitialSelected(1) : null]);
  const [showModalArr, setShowModalArr] = useState([false, false]);
  const headers = ["B", "I", "N", "G", "O"];

  // Persist state for each card
  useEffect(() => {
    for (let i = 0; i < cardCount; i++) {
      localStorage.setItem(getSelectedKey(i), JSON.stringify(selectedArr[i]));
      localStorage.setItem(getCardKey(i), JSON.stringify(columnsArr[i]));
    }
    localStorage.setItem("bingoCardCount", cardCount);
  }, [selectedArr, columnsArr, cardCount]);

  // Free space is always selected for each card
  useEffect(() => {
      let needsUpdate = false;
      const updated = selectedArr.map(sel => {
        if (!sel) return sel;
        if (!sel[2][2]) {
          needsUpdate = true;
          const copy = sel.map(row => [...row]);
          copy[2][2] = true;
          return copy;
        }
        return sel;
      });
      if (needsUpdate) setSelectedArr(updated);
  }, [selectedArr]);

  // Check win for a card
  const checkWin = useCallback((sel, idx) => {
    let allSelected = true;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (i === 2 && j === 2) continue;
        if (!sel[i][j]) allSelected = false;
      }
    }
    if (allSelected) setShowModalArr(prev => prev.map((v, i) => i === idx ? true : v));
  }, []);

  // Handle cell click for a card (with undo/redo)
  const handleCellClick = useCallback((rowIdx, colIdx, idx) => {
    if (colIdx === 2 && rowIdx === 2) return;
    setSelectedArr(prevArr =>
      prevArr.map((sel, i) => {
        if (i !== idx) return sel;
        const newSelected = sel.map((r, rIdx) =>
          r.map((cell, cIdx) => (rIdx === rowIdx && cIdx === colIdx ? !cell : cell))
        );
        checkWin(newSelected, idx);
        return newSelected;
      })
    );
  }, [checkWin]);



  // Add card (max 2)
  const handleAddCard = () => {
    if (cardCount < 2) {
      setColumnsArr(arr => [arr[0], getInitialColumns(1)]);
      setSelectedArr(arr => [arr[0], getInitialSelected(1)]);
      setShowModalArr([false, false]);
      setCardCount(2);
    }
  };

  // Clear all
  const handleClear = () => {
    // Remove only bingo-related keys for safety
    Object.keys(localStorage)
      .filter(k => k.startsWith("bingoCardNumbers_") || k.startsWith("bingoCardSelected_") || k === "bingoCardCount")
      .forEach(k => localStorage.removeItem(k));
    // Force reload immediately to ensure all state is reset and synced
    window.location.reload();
  };

  return (
    <>
      <div className="flex flex-col items-center min-h-screen bg-black p-2">
  <div className="flex flex-col gap-8 justify-center items-center w-full max-w-6xl mb-6">
          {[...Array(cardCount)].map((_, idx) => (
            <div key={idx} className="bingoCard">

              <div className="grid grid-cols-5 gap-2">
                {headers.map((h, i) => (
                  <BingoHeader key={h} label={h} isFirst={i === 0} isLast={i === 4} />
                ))}
                {[0, 1, 2, 3, 4].flatMap((rowIdx) =>
                  columnsArr[idx] && columnsArr[idx].map((col, colIdx) => {
                    const isFree = colIdx === 2 && rowIdx === 2;
                    const isSelected = (colIdx === 2 && rowIdx === 2) || (selectedArr[idx] && selectedArr[idx][rowIdx][colIdx]);
                    let rounded = "";
                    if (rowIdx === 0 && colIdx === 0) rounded = "rounded-tl-xl";
                    if (rowIdx === 0 && colIdx === 4) rounded = "rounded-tr-xl";
                    if (rowIdx === 4 && colIdx === 0) rounded = "rounded-bl-xl";
                    if (rowIdx === 4 && colIdx === 4) rounded = "rounded-br-xl";
                    return (
                      <BingoCell
                        key={colIdx + "-" + rowIdx}
                        value={col[rowIdx]}
                        isSelected={isSelected}
                        isFree={isFree}
                        rounded={rounded}
                        onClick={() => handleCellClick(rowIdx, colIdx, idx)}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") handleCellClick(rowIdx, colIdx, idx);
                        }}
                      />
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mb-8">
          <button
            className="px-6 py-3 bg-blue-700 text-blue-100 rounded hover:bg-blue-800 transition text-lg font-bold"
            onClick={handleClear}
          >
            Clear All
          </button>
          <button
            className="px-6 py-3 bg-blue-700 text-blue-100 rounded hover:bg-blue-800 transition text-lg font-bold disabled:opacity-50"
            onClick={handleAddCard}
            disabled={cardCount === 2}
          >
            Add Card
          </button>
        </div>
        {[...Array(cardCount)].map((_, idx) => (
          <WinningBingoCard
            key={"modal-"+idx}
            open={showModalArr[idx]}
            onClose={() => setShowModalArr(arr => arr.map((v, i) => i === idx ? false : v))}
            headers={headers}
            columns={columnsArr[idx]}
            selected={selectedArr[idx]}
          />
        ))}
      </div>
    </>
  );
}
