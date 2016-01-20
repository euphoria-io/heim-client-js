import { hue } from './hueHash'

function hsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`
}

export function nickBgColor(name) {
  const h = hue(name)
  return {
    background: hsl(h, 65, 85),
    color: 'black',
  }
}

export function nickBgLightColor(name) {
  const h = hue(name)
  return {
    background: hsl(h, 65, 95),
    color: 'black',
  }
}

export function nickBgFullColor(name) {
  const h = hue(name)
  return {
    ...nickBgColor(name),
    color: hsl(h, 28, 28),
  }
}

export function nickFgColor(name) {
  const h = hue(name)
  return {
    color: hsl(h, 100, 40),
  }
}
