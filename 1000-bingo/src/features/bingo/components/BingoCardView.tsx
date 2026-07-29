import type { BingoCard } from '../types'

const HEADERS = ['B', 'I', 'N', 'G', 'O']

interface BingoCardViewProps {
  card: BingoCard
  claimed: boolean
  isPrinted?: boolean
  onClaim: (card: BingoCard) => void
  onTogglePrinted?: (card: BingoCard) => void
  claimsLocked: boolean
  printable?: boolean
}

function BingoCell({ value, isCenter }: { value: string | number; isCenter: boolean }) {
  return (
    <div className={`bingo-cell${isCenter ? ' bingo-cell-free' : ''}`}>
      {value}
    </div>
  )
}

export function BingoCardView({
  card,
  claimed,
  isPrinted = false,
  onClaim,
  onTogglePrinted,
  claimsLocked,
  printable = false,
}: BingoCardViewProps) {
  return (
    <article
      className={`bingo-card color-${card.color}${printable ? ' printable' : ''}${
        isPrinted && !printable ? ' is-printed' : ''
      }`}
    >
      <header className="bingo-card-meta">
        <div className="meta-left">
          <span className="bingo-card-color">{card.color.toUpperCase()} GAME</span>
          {!printable && isPrinted ? (
            <span className="printed-badge" title="This card has been printed">
              ✓ PRINTED
            </span>
          ) : null}
        </div>
        <span className="bingo-card-serial">#{String(card.serial).padStart(4, '0')}</span>
      </header>

      <div className="bingo-brand-strip">
        <span className="bingo-brand-small">LCCB</span>
        <span className="bingo-brand-main">ALUMNI ASSOCIATION</span>
      </div>

      <div className="bingo-grid" role="grid" aria-label={`Bingo card ${card.serial}`}>
        {HEADERS.map((header) => (
          <div key={`${card.id}-${header}`} className="bingo-header" role="columnheader">
            {header}
          </div>
        ))}

        {[0, 1, 2, 3, 4].flatMap((rowIdx) =>
          card.columns.map((column, colIdx) => {
            const cell = column[rowIdx]
            const isCenter = rowIdx === 2 && colIdx === 2

            return <BingoCell key={`${card.id}-${colIdx}-${rowIdx}`} value={cell} isCenter={isCenter} />
          }),
        )}
      </div>

      <p className="bingo-footer-note">START WITH FREE SPOT IN THE CENTER</p>

      {!printable ? (
        <div className="card-actions">
          <button
            type="button"
            className="claim-button"
            onClick={() => onClaim(card)}
            disabled={claimsLocked}
            aria-disabled={claimsLocked}
          >
            {claimed ? 'Winner Selected' : claimsLocked ? 'Winner Locked' : 'Mark Winner'}
          </button>
          {onTogglePrinted ? (
            <button
              type="button"
              className={`toggle-printed-button${isPrinted ? ' is-printed-btn' : ''}`}
              onClick={() => onTogglePrinted(card)}
              title={isPrinted ? 'Click to mark as unprinted' : 'Click to mark as printed'}
            >
              {isPrinted ? '✓ Printed' : '🖨️ Mark Printed'}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
