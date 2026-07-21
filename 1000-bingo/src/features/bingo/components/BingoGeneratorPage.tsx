import { useMemo, useRef, useState } from 'react'
import { COLOR_ORDER, type BingoCard, type ColorName, type GenerationResult, type WinnerState } from '../types'
import { generateUniqueCards } from '../lib/generateUniqueCards'
import { BingoCardView } from './BingoCardView'
import { PrintableSheets } from './PrintableSheets'
import { exportElementToPdf } from '../pdfExport'

const WINNER_STORAGE_KEY = 'bingo-winners-v1'

function createEmptyWinnerState(): WinnerState {
  return {
    green: null,
    orange: null,
    violet: null,
    red: null,
    blue: null,
  }
}

function getInitialWinners(): WinnerState {
  const raw = localStorage.getItem(WINNER_STORAGE_KEY)
  if (!raw) {
    return createEmptyWinnerState()
  }

  try {
    const parsed = JSON.parse(raw) as WinnerState
    return {
      ...createEmptyWinnerState(),
      ...parsed,
    }
  } catch {
    return createEmptyWinnerState()
  }
}

export function BingoGeneratorPage() {
  const [seed, setSeed] = useState('')
  const [activeColor, setActiveColor] = useState<ColorName>('green')
  const [generation, setGeneration] = useState<GenerationResult | null>(null)
  const [winners, setWinners] = useState<WinnerState>(() => getInitialWinners())
  const [status, setStatus] = useState<string>('Generate cards to begin.')
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const printRootRef = useRef<HTMLDivElement | null>(null)

  const activeCards = useMemo(() => {
    if (!generation) {
      return []
    }

    return generation.byColor[activeColor]
  }, [generation, activeColor])

  function persistWinners(nextState: WinnerState): void {
    localStorage.setItem(WINNER_STORAGE_KEY, JSON.stringify(nextState))
  }

  function handleGenerateCards(): void {
    try {
      const result = generateUniqueCards(seed)
      setGeneration(result)
      setStatus(`Generated 1000 unique cards with seed "${result.config.seed}".`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Generation failed.')
    }
  }

  function handleClaimWinner(card: BingoCard): void {
    const locked = winners[card.color]
    if (locked) {
      return
    }

    const nextState: WinnerState = {
      ...winners,
      [card.color]: {
        cardId: card.id,
        serial: card.serial,
        claimedAt: new Date().toISOString(),
      },
    }

    setWinners(nextState)
    persistWinners(nextState)
    setStatus(`${card.color.toUpperCase()} winner locked: #${String(card.serial).padStart(4, '0')}.`)
  }

  function handleResetColorWinner(color: ColorName): void {
    const nextState: WinnerState = {
      ...winners,
      [color]: null,
    }

    setWinners(nextState)
    persistWinners(nextState)
    setStatus(`${color.toUpperCase()} winner lock reset.`)
  }

  function handleResetAllWinners(): void {
    const reset = createEmptyWinnerState()
    setWinners(reset)
    persistWinners(reset)
    setStatus('All winner locks cleared.')
  }

  function handlePrint(): void {
    if (!generation) {
      setStatus('Generate cards before printing.')
      return
    }

    window.print()
  }

  async function handlePdfExport(): Promise<void> {
    if (!generation) {
      setStatus('Generate cards before exporting PDF.')
      return
    }

    const rootElement = printRootRef.current
    if (!rootElement) {
      setStatus('Printable area not found.')
      return
    }

    setIsExportingPdf(true)
    setStatus('Preparing PDF export...')

    try {
      await exportElementToPdf({
        rootElement,
        filename: `bingo-cards-${generation.config.seed}.pdf`,
      })
      setStatus('PDF export complete.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'PDF export failed.')
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="control-panel no-print">
        <div className="title-wrap">
          <h1>1000 Printable Bingo Cards</h1>
          <p>Global uniqueness guaranteed. 200 cards each for Green, Orange, Violet, Red, and Blue.</p>
        </div>

        <div className="actions-grid">
          <label htmlFor="seed-input" className="seed-label">
            Seed (optional)
          </label>
          <input
            id="seed-input"
            className="seed-input"
            type="text"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
            placeholder="event-2026-finals"
          />

          <button type="button" className="primary-button" onClick={handleGenerateCards}>
            Generate 1000 Unique Cards
          </button>

          <button type="button" className="secondary-button" onClick={handlePrint}>
            Print Layout
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={handlePdfExport}
            disabled={isExportingPdf}
          >
            {isExportingPdf ? 'Exporting...' : 'Export PDF'}
          </button>

          <button type="button" className="warning-button" onClick={handleResetAllWinners}>
            Reset All Winner Locks
          </button>
        </div>

        <p className="status-line">{status}</p>
      </section>

      {generation ? (
        <section className="game-panel no-print">
          <nav className="color-tabs" aria-label="Color games">
            {COLOR_ORDER.map((color) => {
              const winner = winners[color]

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setActiveColor(color)}
                  className={`color-tab color-${color}${activeColor === color ? ' active' : ''}`}
                >
                  {color.toUpperCase()} {winner ? `- Winner #${String(winner.serial).padStart(4, '0')}` : '- Open'}
                </button>
              )
            })}
          </nav>

          <div className="winner-tools">
            <span>
              Active game: <strong>{activeColor.toUpperCase()}</strong>
            </span>
            <button type="button" className="secondary-button" onClick={() => handleResetColorWinner(activeColor)}>
              Reset {activeColor.toUpperCase()} Winner
            </button>
          </div>

          <div className="cards-grid">
            {activeCards.map((card) => (
              <BingoCardView
                key={card.id}
                card={card}
                claimed={winners[card.color]?.cardId === card.id}
                claimsLocked={Boolean(winners[card.color])}
                onClaim={handleClaimWinner}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div ref={printRootRef}>
        {generation ? <PrintableSheets byColor={generation.byColor} /> : null}
      </div>
    </main>
  )
}
