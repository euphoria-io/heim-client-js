import { hue } from './hueHash'

function hsl(h, s, l) {
  return 'hsl('+h+', '+s+'%, '+l+'%)'
}

export function nickBgColor(name) {
  let h = hue(name)
  return {
    background: hsl(h, 65, 85),
    color: 'black',
  }
}

export function nickBgLightColor(name) {
  let h = hue(name)
  return {
    background: hsl(h, 65, 95),
    color: 'black',
  }
}

export function nickBgFullColor(name) {
  return {
    ...nickBgColor(name),
    color: hsl(h, 28, 28),
  }
}

export function nickFgColor(name) {
  let h = hue(name)
  return {
    color: hsl(h, 100, 40),
  }
}
