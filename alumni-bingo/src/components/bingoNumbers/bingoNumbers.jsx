import React, { useState } from "react";
import WinnerNumbers from "./winnerNumbers";
import GameSwitcher from "./GameSwitcher";
import NumberGenerator from "./NumberGenerator";
import Loader from "../loader/loader";

export default function BingoNumbers() {
  // Games config: 5 games with color gradient and a simple pattern id
  const games = [
    // game1: green — diamond
    {
      id: "g1",
      name: "Game 1",
      gradient: "linear-gradient(45deg, #6BFFB8 0%, #006400 100%)",
      pattern: "diamond",
    },
    // game2: orange — cross
    {
      id: "g2",
      name: "Game 2",
      gradient: "linear-gradient(45deg, #FFB74D 0%, #FF6F00 100%)",
      pattern: "cross",
    },
    // game3: violet — outside (all outside boxes)
    {
      id: "g3",
      name: "Game 3",
      gradient: "linear-gradient(45deg, #C388FF 0%, #4B0082 100%)",
      pattern: "outside",
    },
    // game4: red — diagonal
    {
      id: "g4",
      name: "Game 4",
      gradient: "linear-gradient(45deg, #FF6B6B 0%, #8B0000 100%)",
      pattern: "diagonal",
    },
    // game5: cooler blue — blackout
    {
      id: "g5",
      name: "Game 5",
      gradient: "linear-gradient(45deg, #4A90E2 0%, #174EA6 100%)",
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

  const [loading, setLoading] = useState(false)
  const [nextGameIndex, setNextGameIndex] = useState(null)

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
        className="flex items-center justify-center w-full min-h-screen"
        style={{
          background: games[selectedGame].gradient,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          transition: "background 400ms ease",
        }}
      >
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto h-full justify-center px-2">
          {/* NumberGenerator renders the draws and controls for the selected game */}
          <NumberGenerator
            config={games[selectedGame]}
          />

          {/* Loader overlay when switching games */}
          <Loader
            show={loading}
            from={1}
            to={75}
            duration={900}
            gradient={nextGameIndex !== null ? games[nextGameIndex].gradient : games[selectedGame].gradient}
            onFinish={() => {
              if (nextGameIndex !== null) {
                setSelectedGame(nextGameIndex)
                setNextGameIndex(null)
              }
              setLoading(false)
            }}
          />

          {/* GameSwitcher moved to bottom */}
          <div className="w-full flex items-center justify-center mt-6 pb-6">
            <GameSwitcher
              games={games}
              selectedIndex={selectedGame}
              onSelect={(i) => {
                if (i === selectedGame) return
                // start loader, then swap game when loader finishes
                setNextGameIndex(i)
                setLoading(true)
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
