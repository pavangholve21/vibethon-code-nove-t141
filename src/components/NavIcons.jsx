export function Icon({ name, className }) {
  const cn = className || 'h-5 w-5'
  switch (name) {
    case 'dashboard':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 13.5V20a1 1 0 0 0 1 1h5v-7.5H4Zm10 0V21h5a1 1 0 0 0 1-1v-6.5h-6ZM4 4a1 1 0 0 1 1-1h5v8H4V4Zm10-1h5a1 1 0 0 1 1 1v7h-6V3Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      )
    case 'simulator':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3v4m0 10v4M3 12h4m10 0h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M8.5 8.5l1.8 1.8m3.4 3.4 1.8 1.8M15.5 8.5l-1.8 1.8m-3.4 3.4-1.8 1.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      )
    case 'learning':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4.5 6.5 12 3l7.5 3.5L12 10 4.5 6.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 10v7.5L12 21l-7.5-3.5V10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 10v11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'quiz':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8.5 8h7M8.5 12h7M8.5 16h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'game':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 16.5h10a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8.5 12h3M10 10.5v3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M15.5 11.2h.01M17.5 12.8h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'playground':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7.5 7.5 4 12l3.5 4.5M16.5 7.5 20 12l-3.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.8 6.5 10.2 17.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'leaderboard':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 20V10h4v10H5Zm5 0V4h4v16h-4Zm5 0v-7h4v7h-4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )
    default:
      return <span className="inline-block" />
  }
}

