import { COLOR_ORDER, type BingoCard, type ColorName, type GenerationResult } from '../types'
import { buildCardId, serializeCard } from './cardIdentity'
import { generateCardColumns } from './cardGenerator'
import { createSeededRng } from './rng'

const TOTAL_CARDS = 1000
const CARDS_PER_COLOR = 200
const MAX_ATTEMPTS = 200000

export function generateUniqueCards(seedInput: string): GenerationResult {
  const seed = seedInput.trim() || `bingo-${new Date().toISOString()}`
  const rng = createSeededRng(seed)

  const identitySet = new Set<string>()
  const byColor = COLOR_ORDER.reduce<Record<ColorName, BingoCard[]>>((acc, color) => {
    acc[color] = []
    return acc
  }, {} as Record<ColorName, BingoCard[]>)

  const cards: BingoCard[] = []
  let attempts = 0

  while (cards.length < TOTAL_CARDS) {
    attempts += 1
    if (attempts > MAX_ATTEMPTS) {
      throw new Error(
        `Unable to generate ${TOTAL_CARDS} unique cards after ${MAX_ATTEMPTS} attempts. Try a different seed.`,
      )
    }

    const columns = generateCardColumns(rng)
    const identity = serializeCard(columns)

    if (identitySet.has(identity)) {
      continue
    }

    identitySet.add(identity)

    const serial = cards.length + 1
    const color = COLOR_ORDER[Math.floor((serial - 1) / CARDS_PER_COLOR)]
    const card: BingoCard = {
      id: buildCardId(color, serial, identity),
      serial,
      color,
      columns,
    }

    cards.push(card)
    byColor[color].push(card)
  }

  return {
    config: {
      totalCards: TOTAL_CARDS,
      cardsPerColor: CARDS_PER_COLOR,
      seed,
    },
    generatedAt: new Date().toISOString(),
    cards,
    byColor,
  }
}
