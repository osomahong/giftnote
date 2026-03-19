export function WaveDivider({ variant = 'to-warm' }: { variant?: 'to-warm' | 'to-default' }) {
  const from = variant === 'to-warm' ? 'var(--color-bg)' : 'var(--color-bg-warm)'
  const to = variant === 'to-warm' ? 'var(--color-bg-warm)' : 'var(--color-bg)'

  return (
    <div aria-hidden="true" role="presentation" className="w-full h-12 relative -my-px">
      <svg
        viewBox="0 0 1440 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0 0h1440v24c-240 16-480 24-720 24S240 40 0 24V0z"
          fill={from}
        />
        <path
          d="M0 48h1440V24c-240-16-480-24-720-24S240 8 0 24v24z"
          fill={to}
        />
      </svg>
    </div>
  )
}
