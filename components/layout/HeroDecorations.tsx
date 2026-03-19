export function HeroDecorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src="/svg/decorative/gift-box.svg"
        alt=""
        className="absolute top-[10%] left-[5%] w-10 h-10 md:w-12 md:h-12 opacity-15 animate-float delay-1 hidden md:block"
      />
      <img
        src="/svg/decorative/heart.svg"
        alt=""
        className="absolute top-[15%] right-[8%] w-8 h-8 md:w-10 md:h-10 opacity-15 animate-wobble delay-2"
      />
      <img
        src="/svg/decorative/star.svg"
        alt=""
        className="absolute bottom-[20%] left-[8%] w-8 h-8 opacity-10 animate-wobble delay-3 hidden md:block"
      />
    </div>
  )
}
