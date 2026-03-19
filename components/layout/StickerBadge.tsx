interface StickerBadgeProps {
  text: string
  colorClass: string
  rotation?: number
}

export function StickerBadge({ text, colorClass, rotation = -3 }: StickerBadgeProps) {
  return (
    <span
      className={`inline-block font-hand text-sm font-bold text-white px-3 py-1 rounded-full shadow-sm ${colorClass}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      {text}
    </span>
  )
}
