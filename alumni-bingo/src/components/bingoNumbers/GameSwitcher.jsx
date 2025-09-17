import React from 'react';

export default function GameSwitcher({ games, selectedIndex, onSelect }) {
  return (
    <div className="w-full flex items-center justify-center mb-4">
      <div className="flex gap-3 flex-wrap justify-center">
        {games.map((g, i) => (
          <button
            key={g.id}
            onClick={() => onSelect(i)}
            className={`px-4 py-2 rounded-full font-bold text-black shadow-md transform transition-colors ${selectedIndex === i ? 'ring-4 ring-offset-2' : ''}`}
            style={{
              backgroundColor: g.gradient,
              border: 'none',
            }}
            aria-pressed={selectedIndex === i}
          >
            {g.name}
          </button>
        ))}
      </div>
    </div>
  );
}
