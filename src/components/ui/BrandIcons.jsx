export function FlagIcon({ country, className = 'flag' }) {
  if (country === 'cn') {
    return (
      <svg className={className} viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#de2910" />
        <path
          fill="#ffde00"
          d="M5 3l1.18 3.6h3.8l-3.07 2.23 1.17 3.6L5 10.2l-3.08 2.23 1.18-3.6L.02 6.6h3.8z"
        />
        <circle cx="10.5" cy="2.5" r=".9" fill="#ffde00" />
        <circle cx="12.5" cy="4.6" r=".9" fill="#ffde00" />
        <circle cx="12.5" cy="7.6" r=".9" fill="#ffde00" />
        <circle cx="10.5" cy="9.6" r=".9" fill="#ffde00" />
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" fill="#fff" />
      <rect width="30" height="6.67" fill="#ff9933" />
      <rect y="13.33" width="30" height="6.67" fill="#138808" />
      <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth=".7" />
      <circle cx="15" cy="10" r=".6" fill="#000080" />
    </svg>
  )
}

export function ImportNowWordmark() {
  return (
    <>
      <span>IMP</span>
      <svg className="wordmark__globe" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M8.2 3.1A9.5 9.5 0 1 0 15.8 3.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.6"
        />
        <path
          d="M12 1.5v10.2M7.6 8l4.4 4.6L16.4 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
        />
      </svg>
      <span>RTNOW</span>
    </>
  )
}
