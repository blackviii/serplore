export const BRAND_RED = '#FF4500'

export function LogoMark({ className = 'h-9 w-9 text-[#FF4500]', decorative = true }) {
  const accessibilityProps = decorative
    ? { 'aria-hidden': 'true' }
    : { role: 'img', 'aria-label': 'Serplore logo' }

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...accessibilityProps}
    >
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <path
        fill="#fff"
        d="M49.2 16H28.6c-8 0-14.4 5.3-14.4 12.2 0 6.5 5.2 11.3 12.3 11.3h11.3c2 0 3.4 1.1 3.4 2.7 0 1.7-1.4 2.8-3.4 2.8H19l-4.9 5h24.3c7.7 0 13.5-5 13.5-11.8 0-6.3-5.1-11-12.1-11H28.5c-2 0-3.5-1-3.5-2.6 0-1.7 1.5-2.8 3.7-2.8h14.8L49.2 16Z"
      />
    </svg>
  )
}

export default function BrandLogo({
  markClassName = 'h-9 w-9 text-[#FF4500]',
  textClassName = 'text-xl font-black tracking-tight text-gray-950',
  showText = true,
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={markClassName} />
      {showText && <span className={textClassName}>Serplore</span>}
    </span>
  )
}
