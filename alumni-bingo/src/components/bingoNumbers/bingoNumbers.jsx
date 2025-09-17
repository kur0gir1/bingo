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
  gradient: "#eff1e4",
      pattern: "B",
    },
    // game2: orange — cross
    {
      id: "g2",
      name: "Game 2",
  gradient: "#eff1e4",
      pattern: "M",
    },
    // game3: violet — outside (all outside boxes)
    {
      id: "g3",
      name: "Game 3",
  gradient: "#eff1e4",
      pattern: "E",
    },
    // game4: red — diagonal
    {
      id: "g4",
      name: "Game 4",
  gradient: "#eff1e4",
      pattern: "G",
    },
    // game5: cooler blue — blackout
    // {
    //   id: "g5",
    //   name: "Game 5",
    //   gradient: "linear-gradient(45deg, #4A90E2 0%, #174EA6 100%)",
    //   pattern: "blackout",
    // },
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
          backgroundColor: games[selectedGame].gradient,
          transition: "background-color 400ms ease",
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
