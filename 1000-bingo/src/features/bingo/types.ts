export const COLOR_ORDER = ['green', 'orange', 'violet', 'red', 'blue'] as const

export type ColorName = (typeof COLOR_ORDER)[number]

export type BingoCell = number | 'FREE'

export type BingoColumn = [BingoCell, BingoCell, BingoCell, BingoCell, BingoCell]

export type BingoCardColumns = [BingoColumn, BingoColumn, BingoColumn, BingoColumn, BingoColumn]

export interface BingoCard {
  id: string
  serial: number
  color: ColorName
  columns: BingoCardColumns
}

export interface ColoredCardBatch {
  color: ColorName
  cards: BingoCard[]
}

export interface WinnerRecord {
  cardId: string
  serial: number
  claimedAt: string
}

export type WinnerState = Record<ColorName, WinnerRecord | null>

export interface GenerationConfig {
  totalCards: number
  cardsPerColor: number
  seed: string
}

export interface GenerationResult {
  config: GenerationConfig
  generatedAt: string
  cards: BingoCard[]
  byColor: Record<ColorName, BingoCard[]>
}
