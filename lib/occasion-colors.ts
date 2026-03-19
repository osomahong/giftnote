export type OccasionColorKey = 'coral' | 'olive' | 'lemon' | 'lavender' | 'terra'

export interface OccasionColor {
  key: OccasionColorKey
  bg: string
  bar: string
  badgeBg: string
  highlight: string
  text: string
}

const OCCASION_COLORS: Record<OccasionColorKey, OccasionColor> = {
  coral: {
    key: 'coral',
    bg: 'bg-occasion-coral',
    bar: 'bg-occasion-coral',
    badgeBg: 'bg-occasion-coral',
    highlight: 'bg-occasion-coral/20',
    text: 'text-[#B94A4A]',
  },
  olive: {
    key: 'olive',
    bg: 'bg-occasion-olive',
    bar: 'bg-occasion-olive',
    badgeBg: 'bg-occasion-olive',
    highlight: 'bg-occasion-olive/20',
    text: 'text-[#5C8F10]',
  },
  lemon: {
    key: 'lemon',
    bg: 'bg-occasion-lemon',
    bar: 'bg-occasion-lemon',
    badgeBg: 'bg-occasion-lemon',
    highlight: 'bg-occasion-lemon/20',
    text: 'text-[#92710F]',
  },
  lavender: {
    key: 'lavender',
    bg: 'bg-occasion-lavender',
    bar: 'bg-occasion-lavender',
    badgeBg: 'bg-occasion-lavender',
    highlight: 'bg-occasion-lavender/20',
    text: 'text-[#6D5BA3]',
  },
  terra: {
    key: 'terra',
    bg: 'bg-occasion-terra',
    bar: 'bg-occasion-terra',
    badgeBg: 'bg-occasion-terra',
    highlight: 'bg-occasion-terra/20',
    text: 'text-[#A04E20]',
  },
}

const OCCASION_MAP: [string[], OccasionColorKey][] = [
  [['생일'], 'coral'],
  [['집들이'], 'olive'],
  [['감사', '명절', '추석', '설'], 'lemon'],
  [['기념일', '결혼', '돌잔치'], 'lavender'],
]

export function getOccasionColor(occasion: string): OccasionColor {
  for (const [keywords, key] of OCCASION_MAP) {
    if (keywords.some(kw => occasion.includes(kw))) {
      return OCCASION_COLORS[key]
    }
  }
  return OCCASION_COLORS.terra
}
