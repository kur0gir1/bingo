import { COLOR_ORDER, type BingoCard, type ColorName, type GenerationResult } from '../types'
import { buildCardId, serializeCard } from './cardIdentity'
import { generateCardColumns } from './cardGenerator'
import { createSeededRng } from './rng'

const MAX_ATTEMPTS_PER_CARD = 200

export function generateUniqueCards(
  seedInput: string,
  cardsPerColorInput: number = 200,
): GenerationResult {
  const seed = seedInput.trim() || `bingo-${new Date().toISOString()}`
  const rng = createSeededRng(seed)

  const cardsPerColor = Math.min(Math.max(1, Math.round(cardsPerColorInput) || 200), 1000)
  const totalCards = cardsPerColor * COLOR_ORDER.length
  const maxAttempts = totalCards * MAX_ATTEMPTS_PER_CARD

  const identitySet = new Set<string>()
  const byColor = COLOR_ORDER.reduce<Record<ColorName, BingoCard[]>>((acc, color) => {
    acc[color] = []
    return acc
  }, {} as Record<ColorName, BingoCard[]>)

  const cards: BingoCard[] = []
  let attempts = 0

  while (cards.length < totalCards) {
    attempts += 1
    if (attempts > maxAttempts) {
      throw new Error(
        `Unable to generate ${totalCards} unique cards after ${maxAttempts} attempts. Try a different seed.`,
      )
    }

    const columns = generateCardColumns(rng)
    const identity = serializeCard(columns)

    if (identitySet.has(identity)) {
      continue
    }

    identitySet.add(identity)

    const serial = cards.length + 1
    const colorIndex = Math.floor((serial - 1) / cardsPerColor)
    const color = COLOR_ORDER[colorIndex]
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
      totalCards,
      cardsPerColor,
      seed,
    },
    generatedAt: new Date().toISOString(),
    cards,
    byColor,
  }
}
