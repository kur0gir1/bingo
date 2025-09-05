import React from 'react'

export default function ConfirmReset({ open, onConfirm, onCancel, gradient }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 w-[min(520px,90vw)]">
        <div className="text-white text-lg font-bold mb-2">Confirm reset</div>
        <div className="text-sm text-gray-200 mb-4">This will clear all drawn numbers and reset the game. Are you sure?</div>
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded-md bg-gray-700 text-white"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-md text-white font-bold"
            style={{ background: gradient || '#e11d48' }}
            onClick={onConfirm}
          >
            Yes, reset
          </button>
        </div>
      </div>
    </div>
  )
}
