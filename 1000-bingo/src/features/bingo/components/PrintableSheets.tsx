import { COLOR_ORDER, type BingoCard, type ColorName } from '../types'
import { BingoCardView } from './BingoCardView'

const CARDS_PER_PRINT_PAGE = 4

interface PrintableSheetsProps {
  byColor: Record<ColorName, BingoCard[]>
}

function toPages(cards: BingoCard[]): BingoCard[][] {
  const pages: BingoCard[][] = []
  for (let i = 0; i < cards.length; i += CARDS_PER_PRINT_PAGE) {
    pages.push(cards.slice(i, i + CARDS_PER_PRINT_PAGE))
  }
  return pages
}

export function PrintableSheets({ byColor }: PrintableSheetsProps) {
  return (
    <section className="print-root" aria-hidden="true">
      {COLOR_ORDER.map((color) => {
        const pages = toPages(byColor[color])

        return pages.map((pageCards, pageIndex) => (
          <div key={`${color}-page-${pageIndex + 1}`} className={`print-page color-${color}`}>
            <header className="print-page-header">
              <h2>{color.toUpperCase()} BINGO — 4 CARDS (9cm × 13.5cm)</h2>
              <span className="cut-guide-instruction">✂ Cut along dashed borders</span>
              <p>
                Page {pageIndex + 1} / {pages.length}
              </p>
            </header>

            <div className="print-page-grid">
              {pageCards.map((card) => (
                <div key={card.id} className="printable-card-wrapper">
                  <span className="crop-mark crop-top-left" aria-hidden="true" />
                  <span className="crop-mark crop-top-right" aria-hidden="true" />
                  <span className="crop-mark crop-bottom-left" aria-hidden="true" />
                  <span className="crop-mark crop-bottom-right" aria-hidden="true" />
                  <BingoCardView
                    card={card}
                    claimed={false}
                    onClaim={() => {
                      // Print-mode card is display-only.
                    }}
                    claimsLocked
                    printable
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      })}
    </section>
  )
}
