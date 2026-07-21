import type { BingoCardColumns, BingoColumn } from '../types'
import type { Rng } from './rng'

interface ColumnRange {
  min: number
  max: number
}

const COLUMN_RANGES: ColumnRange[] = [
  { min: 1, max: 15 },
  { min: 16, max: 30 },
  { min: 31, max: 45 },
  { min: 46, max: 60 },
  { min: 61, max: 75 },
]

function randomIntInclusive(rng: Rng, min: number, max: number): number {
  return Math.floor(rng.next() * (max - min + 1)) + min
}

function createUniqueColumnNumbers(rng: Rng, min: number, max: number): BingoColumn {
  const numbers = new Set<number>()

  while (numbers.size < 5) {
    numbers.add(randomIntInclusive(rng, min, max))
  }

  const values = Array.from(numbers)
  return [values[0], values[1], values[2], values[3], values[4]]
}

export function generateCardColumns(rng: Rng): BingoCardColumns {
  const columns = COLUMN_RANGES.map((range) =>
    createUniqueColumnNumbers(rng, range.min, range.max),
  ) as BingoCardColumns

  columns[2][2] = 'FREE'

  return columns
}
