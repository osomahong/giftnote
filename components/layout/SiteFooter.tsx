export function SiteFooter() {
  return (
    <footer className="border-t border-border-light bg-bg-warm">
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-sm text-text-muted">
        <img src="/svg/logo.svg" alt="기프트노트" className="h-5 mx-auto mb-2" />
        <p>마음을 전하는 선물 큐레이션</p>
        <p className="mt-4 text-xs">
          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
        </p>
        <p className="mt-1 text-xs">© {new Date().getFullYear()} giftNote. All rights reserved.</p>
      </div>
    </footer>
  )
}
