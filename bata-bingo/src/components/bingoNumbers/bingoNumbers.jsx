import React, { useState } from "react";
import WinnerNumbers from "./winnerNumbers";
import GameSwitcher from "./GameSwitcher";
import NumberGenerator from "./NumberGenerator";
import Loader from "../loader/loader";


export default function BingoNumbers() {
  // Games config: 5 games for the 77th Alumni Homecoming
  const games = [
    {
      id: "g1",
      name: "Game 1",
      color: "#00aa5a", // green
      pattern: "hollow_diamond",
    },
    {
      id: "g2",
      name: "Game 2",
      color: "#ff6f00", // orange
      pattern: "x",
    },
    {
      id: "g3",
      name: "Game 3",
      color: "#8041c8", // violet
      pattern: "hollow_square",
    },
    {
      id: "g4",
      name: "Game 4",
      color: "#ff3344", // red
      pattern: "right_triangle",
    },
    {
      id: "g5",
      name: "Game 5",
      color: "#0070f3", // blue
      pattern: "blackout",
    },
  ];
  const [selectedGame, setSelectedGame] = useState(() => {
    try {
      const s = localStorage.getItem("selectedBingoGame");
      return s ? JSON.parse(s) : 0;
    } catch {
      return 0;
    }
  });

  const [loading, setLoading] = useState(false);
  const [nextGameIndex, setNextGameIndex] = useState(null);

  // Persist selection
  React.useEffect(() => {
    try {
      localStorage.setItem("selectedBingoGame", JSON.stringify(selectedGame));
    } catch {
      /* ignore */
    }
  }, [selectedGame]);

  return (
    <>
      <div
        className="relative flex items-center justify-center w-full min-h-screen"
        style={{
          backgroundColor: games[selectedGame].color,
          transition: "background-color 400ms ease",
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />
        <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto h-full justify-center px-2 z-10">
          {/* NumberGenerator renders the draws and controls for the selected game */}
          <NumberGenerator config={games[selectedGame]} />

          {/* Loader overlay when switching games */}
          <Loader
            show={loading}
            from={1}
            to={75}
            duration={900}
            gradient={
              nextGameIndex !== null
                ? games[nextGameIndex].color
                : games[selectedGame].color
            }
            onFinish={() => {
              if (nextGameIndex !== null) {
                setSelectedGame(nextGameIndex);
                setNextGameIndex(null);
              }
              setLoading(false);
            }}
          />

          {/* GameSwitcher moved to bottom */}
          <div className="w-full flex items-center justify-center mt-6 pb-6">
            <GameSwitcher
              games={games}
              selectedIndex={selectedGame}
              onSelect={(i) => {
                if (i === selectedGame) return;
                // start loader, then swap game when loader finishes
                setNextGameIndex(i);
                setLoading(true);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
