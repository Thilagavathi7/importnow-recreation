const iconMarkup = {
  sourcing: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3M8 11h6M11 8v6" />
    </>
  ),
  factory: (
    <>
      <path d="M3 21V9l6 4V9l6 4V5l6 4v12H3z" />
      <path d="M7 17h2M12 17h2M17 17h1" />
    </>
  ),
  quality: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </>
  ),
  shipping: (
    <>
      <path d="M3 17l1.6 3.2c.2.4.6.8 1.1.8h12.6c.5 0 .9-.3 1.1-.8L21 17H3zM5 17V12h14v5M8 12V8h8v4M11 8V4h3v4M2 22c1.5-.8 3-.8 4.5 0s3 .8 4.5 0 3-.8 4.5 0 3 .8 4.5 0" />
    </>
  ),
  customs: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M10 13h6M10 17h6" />
    </>
  ),
  delivery: (
    <>
      <path d="M1 6h13v10H1zM14 10h4l4 3v3h-8z" />
      <circle cx="5.5" cy="18" r="2" />
      <circle cx="17.5" cy="18" r="2" />
    </>
  ),
  furniture: (
    <>
      <path d="M3 11h18v6H3zM5 17v3M19 17v3M5 11V7a2 2 0 012-2h10a2 2 0 012 2v4" />
    </>
  ),
  electronics: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  automotive: (
    <>
      <circle cx="5.5" cy="17" r="3.5" />
      <circle cx="18.5" cy="17" r="3.5" />
      <path d="M5.5 17l4-8h5l4 8M9 6h3" />
    </>
  ),
  lighting: (
    <>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9V16h7v-2.1A6 6 0 0012 3z" />
    </>
  ),
  merchandise: (
    <>
      <path d="M3 4h2l2.5 11h11L21 7H7M9 20a1 1 0 100-2 1 1 0 000 2zM18 20a1 1 0 100-2 1 1 0 000 2z" />
    </>
  ),
  machinery: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  desk: (
    <>
      <path d="M3 8h18v3H3zM5 11v9M19 11v9M10 8V5h4v3" />
    </>
  ),
  venue: (
    <>
      <path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6M7 10h2M15 10h2" />
    </>
  ),
  visa: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  hotel: (
    <>
      <path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6" />
    </>
  ),
  food: (
    <>
      <path d="M4 11h16a8 8 0 01-16 0zM12 3v4M8 5v2M16 5v2" />
    </>
  ),
  translate: (
    <>
      <path d="M4 5h9M8.5 3v2M6 5c0 4 3 7 6 8M11 5c-1 4-4 7-7 8M14 21l4-9 4 9M15.5 18h5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
}

const largeIconMarkup = {
  route: (
    <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="48" r="6" />
      <circle cx="50" cy="16" r="6" />
      <path d="M20 48h18a8 8 0 000-16H26a8 8 0 010-16h18" strokeDasharray="4 5" />
    </g>
  ),
  market: (
    <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round">
      <path d="M8 26l5-14h38l5 14M8 26h48v4a7 7 0 01-12 5 7 7 0 01-12 0 7 7 0 01-12 0A7 7 0 018 30z" />
      <path d="M12 36v18h40V36M26 54V42h12v12" />
    </g>
  ),
  sofa: (
    <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round">
      <path d="M14 28v-8a6 6 0 016-6h24a6 6 0 016 6v8" />
      <path d="M8 32a5 5 0 0110 0v6h28v-6a5 5 0 0110 0v14H8z" />
      <path d="M14 46v6M50 46v6" />
    </g>
  ),
}

function LineIcon({ name, className = '', strokeWidth = 1.8 }) {
  if (largeIconMarkup[name]) {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {largeIconMarkup[name]}
      </svg>
    )
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {iconMarkup[name]}
    </svg>
  )
}

export default LineIcon
