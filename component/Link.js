import React from 'react'

export default function Link({ children, push, to }) {
  const onClick = ev => {
    push(to)
    ev.preventDefault()
  }

  return <a href={to} onClick={onClick}>{children}</a>
}
