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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 48V16h19c7.2 0 12.4 4.7 12.4 11.3 0 5.1-3.1 9-7.9 10.4L48 48H36.2l-7.5-10H26v10H16Zm10-18.5h8.4c2.5 0 4.2-1.5 4.2-3.7S36.9 22 34.4 22H26v7.5Z"
      />
    </svg>
  )
}

export default function BrandLogo({
  markClassName = 'h-9 w-9 text-[#FF4500]',
  textClassName = 'text-lg font-bold text-gray-950',
  showText = true,
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className={markClassName} />
      {showText && <span className={textClassName}>Serplore</span>}
    </span>
  )
}
