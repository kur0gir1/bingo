import type { BingoCardColumns } from '../types'

export function serializeCard(columns: BingoCardColumns): string {
  return columns
    .map((column) =>
      column
        .map((cell) => {
          if (cell === 'FREE') {
            return 'F'
          }

          return String(cell).padStart(2, '0')
        })
        .join('-'),
    )
    .join('|')
}

export function buildCardId(color: string, serial: number, identity: string): string {
  return `${color.toUpperCase()}-${String(serial).padStart(4, '0')}-${identity}`
}
