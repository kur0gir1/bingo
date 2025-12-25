import React, { useState } from "react";
import WinnerNumbers from "./winnerNumbers";
import GameSwitcher from "./GameSwitcher";
import NumberGenerator from "./NumberGenerator";
import Loader from "../loader/loader";
import bgImage from "../../assets/bata bg.jpg";

export default function BingoNumbers() {
  // Games config: 5 games with color gradient and a simple pattern id
  const games = [
    {
      id: "g1",
      name: "Game 1",
      color: "#1e90ff", // blue
      pattern: "corners",
    },
    {
      id: "g2",
      name: "Game 2",
      color: "#ffb300", // yellow
      pattern: "pyramid",
    },
    {
      id: "g3",
      name: "Game 3",
      color: "#43a047", // green
      pattern: "y",
    },
    {
      id: "g4",
      name: "Game 4",
      color: "#e53935", // red
      pattern: "c",
    },
    {
      id: "g5",
      name: "Game 5",
      color: "#8e24aa", // purple
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
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
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
