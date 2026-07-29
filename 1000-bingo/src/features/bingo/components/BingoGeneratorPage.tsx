import { useMemo, useRef, useState } from 'react'
import { COLOR_ORDER, type BingoCard, type ColorName, type GenerationResult, type WinnerState } from '../types'
import { generateUniqueCards } from '../lib/generateUniqueCards'
import { BingoCardView } from './BingoCardView'
import { PrintableSheets } from './PrintableSheets'
import { exportElementToPdf } from '../pdfExport'

const WINNER_STORAGE_KEY = 'bingo-winners-v1'
const GENERATION_STORAGE_KEY = 'bingo-generation-v1'
const PRINTED_STORAGE_KEY = 'bingo-printed-cards-v1'

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

function getInitialGeneration(): GenerationResult | null {
  const raw = localStorage.getItem(GENERATION_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as GenerationResult
  } catch {
    return null
  }
}

function getInitialPrintedCards(): Record<string, boolean> {
  const raw = localStorage.getItem(PRINTED_STORAGE_KEY)
  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw) as Record<string, boolean>
  } catch {
    return {}
  }
}

export function BingoGeneratorPage() {
  const [generation, setGeneration] = useState<GenerationResult | null>(() => getInitialGeneration())
  const [cardsPerColor, setCardsPerColor] = useState<number>(() => generation?.config.cardsPerColor ?? 200)
  const [cardsInputText, setCardsInputText] = useState<string>(() => String(generation?.config.cardsPerColor ?? 200))
  const [seed, setSeed] = useState<string>(() => generation?.config.seed ?? '')
  const [activeColor, setActiveColor] = useState<ColorName>('green')
  const [winners, setWinners] = useState<WinnerState>(() => getInitialWinners())
  const [printedCards, setPrintedCards] = useState<Record<string, boolean>>(() => getInitialPrintedCards())
  const [status, setStatus] = useState<string>(() =>
    generation
      ? `Restored digital copy of ${generation.config.totalCards} cards (${generation.config.cardsPerColor} per color, Seed: "${generation.config.seed}").`
      : 'Generate cards to begin.',
  )
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const printRootRef = useRef<HTMLDivElement | null>(null)

  const totalCardsCount = useMemo(() => {
    return generation ? generation.config.totalCards : cardsPerColor * COLOR_ORDER.length
  }, [generation, cardsPerColor])

  const activeCards = useMemo(() => {
    if (!generation) {
      return []
    }

    return generation.byColor[activeColor]
  }, [generation, activeColor])

  const printedStatsByColor = useMemo(() => {
    if (!generation) {
      return { totalPrinted: 0, byColor: { green: 0, orange: 0, violet: 0, red: 0, blue: 0 } }
    }

    const stats = { green: 0, orange: 0, violet: 0, red: 0, blue: 0 }
    let totalPrinted = 0

    COLOR_ORDER.forEach((col) => {
      const cards = generation.byColor[col] || []
      const printedCount = cards.filter((c) => printedCards[c.id]).length
      stats[col] = printedCount
      totalPrinted += printedCount
    })

    return { totalPrinted, byColor: stats }
  }, [generation, printedCards])

  function persistWinners(nextState: WinnerState): void {
    localStorage.setItem(WINNER_STORAGE_KEY, JSON.stringify(nextState))
  }

  function persistPrintedCards(nextState: Record<string, boolean>): void {
    setPrintedCards(nextState)
    try {
      localStorage.setItem(PRINTED_STORAGE_KEY, JSON.stringify(nextState))
    } catch (err) {
      console.warn('Failed to save printed cards to localStorage:', err)
    }
  }

  function handleTogglePrinted(card: BingoCard): void {
    const nextState = {
      ...printedCards,
      [card.id]: !printedCards[card.id],
    }
    persistPrintedCards(nextState)
  }

  function handleMarkColorPrinted(color: ColorName, value: boolean): void {
    if (!generation) return
    const colorCards = generation.byColor[color] || []
    const nextState = { ...printedCards }
    colorCards.forEach((c) => {
      if (value) {
        nextState[c.id] = true
      } else {
        delete nextState[c.id]
      }
    })
    persistPrintedCards(nextState)
    setStatus(`${color.toUpperCase()} cards marked as ${value ? 'printed' : 'not printed'}.`)
  }

  function handleMarkAllPrinted(value: boolean): void {
    if (!generation) return
    const nextState = { ...printedCards }
    generation.cards.forEach((c) => {
      if (value) {
        nextState[c.id] = true
      } else {
        delete nextState[c.id]
      }
    })
    persistPrintedCards(nextState)
    setStatus(`All ${generation.cards.length} cards marked as ${value ? 'printed' : 'not printed'}.`)
  }

  function handleCardsPerColorSliderChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const val = parseInt(event.target.value, 10)
    setCardsPerColor(val)
    setCardsInputText(String(val))
  }

  function handleCardsPerColorTextInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const valStr = event.target.value
    setCardsInputText(valStr)
    const parsed = parseInt(valStr, 10)
    if (!isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(1000, parsed))
      setCardsPerColor(clamped)
    }
  }

  function handleCardsPerColorTextInputBlur(): void {
    const parsed = parseInt(cardsInputText, 10)
    if (isNaN(parsed) || parsed < 1) {
      setCardsPerColor(1)
      setCardsInputText('1')
    } else if (parsed > 1000) {
      setCardsPerColor(1000)
      setCardsInputText('1000')
    } else {
      const clamped = Math.max(1, Math.min(1000, parsed))
      setCardsPerColor(clamped)
      setCardsInputText(String(clamped))
    }
  }

  function handlePresetSelect(count: number): void {
    setCardsPerColor(count)
    setCardsInputText(String(count))
  }

  function handleGenerateCards(): void {
    try {
      const result = generateUniqueCards(seed, cardsPerColor)
      setGeneration(result)
      try {
        localStorage.setItem(GENERATION_STORAGE_KEY, JSON.stringify(result))
      } catch (err) {
        console.warn('Failed to save bingo generation to localStorage:', err)
      }
      setStatus(
        `Generated ${result.config.totalCards} unique cards (${result.config.cardsPerColor} per color) with seed "${result.config.seed}" (saved to local storage).`,
      )
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Generation failed.')
    }
  }

  function handleClearSavedCards(): void {
    localStorage.removeItem(GENERATION_STORAGE_KEY)
    setGeneration(null)
    setStatus('Saved digital copy cleared. Click Generate to create a new set.')
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

  function markCurrentGenerationAsPrinted(): void {
    if (!generation) return
    const nextState = { ...printedCards }
    generation.cards.forEach((c) => {
      nextState[c.id] = true
    })
    persistPrintedCards(nextState)
  }

  function handlePrint(): void {
    if (!generation) {
      setStatus('Generate cards before printing.')
      return
    }

    markCurrentGenerationAsPrinted()
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
      markCurrentGenerationAsPrinted()
      setStatus('PDF export complete (all cards marked as printed).')
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
          <h1>{totalCardsCount.toLocaleString()} Printable Bingo Cards</h1>
          <p>
            Global uniqueness guaranteed. {generation ? generation.config.cardsPerColor : cardsPerColor} cards each for
            Green, Orange, Violet, Red, and Blue ({totalCardsCount.toLocaleString()} total cards).
            {generation && printedStatsByColor.totalPrinted > 0 ? (
              <strong className="overall-printed-info">
                {' '}
                • 🖨️ {printedStatsByColor.totalPrinted} / {generation.config.totalCards} Printed
              </strong>
            ) : null}
          </p>
        </div>

        <div className="config-controls">
          <div className="cards-slider-group">
            <div className="slider-header">
              <label htmlFor="cards-number-input" className="control-label">
                Cards per Color:
              </label>
              <div className="cards-input-wrap">
                <input
                  id="cards-number-input"
                  className="cards-number-input"
                  type="number"
                  min={1}
                  max={1000}
                  value={cardsInputText}
                  onChange={handleCardsPerColorTextInputChange}
                  onBlur={handleCardsPerColorTextInputBlur}
                />
                <span className="total-badge">Total: {cardsPerColor * 5} cards</span>
              </div>
            </div>

            <div className="slider-row">
              <input
                id="cards-slider-input"
                className="cards-slider"
                type="range"
                min={1}
                max={1000}
                value={cardsPerColor}
                onChange={handleCardsPerColorSliderChange}
              />
            </div>

            <div className="preset-chips">
              <span className="preset-label">Quick Presets:</span>
              {[50, 100, 200, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`preset-chip${cardsPerColor === preset ? ' active' : ''}`}
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset} / color ({preset * 5})
                </button>
              ))}
            </div>
          </div>

          <div className="seed-group">
            <label htmlFor="seed-input" className="control-label">
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
          </div>
        </div>

        <div className="actions-row">
          <button type="button" className="primary-button" onClick={handleGenerateCards}>
            Generate {(cardsPerColor * 5).toLocaleString()} Unique Cards
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

          {generation ? (
            <button type="button" className="secondary-button" onClick={handleClearSavedCards}>
              Clear Saved Cards
            </button>
          ) : null}

          {generation ? (
            <button
              type="button"
              className="secondary-button"
              onClick={() => handleMarkAllPrinted(printedStatsByColor.totalPrinted < generation.cards.length)}
            >
              {printedStatsByColor.totalPrinted < generation.cards.length ? '🖨️ Mark All Printed' : 'Unmark All Printed'}
            </button>
          ) : null}

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
              const cardCount = generation.byColor[color]?.length ?? 0
              const printedCount = printedStatsByColor.byColor[color]

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setActiveColor(color)}
                  className={`color-tab color-${color}${activeColor === color ? ' active' : ''}`}
                >
                  <span className="tab-title">{color.toUpperCase()}</span>
                  <span className="tab-sub">
                    ({cardCount} cards • {printedCount} Printed)
                  </span>
                  {winner ? <span className="tab-winner">Winner #{String(winner.serial).padStart(4, '0')}</span> : null}
                </button>
              )
            })}
          </nav>

          <div className="winner-tools">
            <div className="winner-tools-left">
              <span>
                Active game: <strong>{activeColor.toUpperCase()}</strong> ({generation.byColor[activeColor]?.length ?? 0} cards •{' '}
                <span className="printed-count-text">
                  {printedStatsByColor.byColor[activeColor]} / {generation.byColor[activeColor]?.length ?? 0} Printed
                </span>
                )
              </span>
            </div>

            <div className="winner-tools-right">
              <button
                type="button"
                className="secondary-button small-btn"
                onClick={() =>
                  handleMarkColorPrinted(
                    activeColor,
                    printedStatsByColor.byColor[activeColor] < (generation.byColor[activeColor]?.length ?? 0),
                  )
                }
              >
                {printedStatsByColor.byColor[activeColor] < (generation.byColor[activeColor]?.length ?? 0)
                  ? `Mark All ${activeColor.toUpperCase()} Printed`
                  : `Unmark ${activeColor.toUpperCase()}`}
              </button>
              <button type="button" className="secondary-button small-btn" onClick={() => handleResetColorWinner(activeColor)}>
                Reset {activeColor.toUpperCase()} Winner
              </button>
            </div>
          </div>

          <div className="cards-grid">
            {activeCards.map((card) => (
              <BingoCardView
                key={card.id}
                card={card}
                claimed={winners[card.color]?.cardId === card.id}
                isPrinted={Boolean(printedCards[card.id])}
                claimsLocked={Boolean(winners[card.color])}
                onClaim={handleClaimWinner}
                onTogglePrinted={handleTogglePrinted}
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
