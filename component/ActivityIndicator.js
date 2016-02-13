import React from 'react'

export default function ActivityIndicator({ push, to }) {
  const onClick = ev => {
    push(to)
    ev.preventDefault()
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 160 140"
      preserveAspectRatio="xMidYMid slice"
      onClick={onClick}
    >
      <circle className="outline" cx="70" cy="70" r="70" />
      <rect className="outline" x="70" y="0" width="90" height="140" />
      <circle cx="70" cy="70" r="50" />
      <rect x="70" y="20" width="70" height="100" />
    </svg>
  )
}
