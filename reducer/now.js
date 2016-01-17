import { TICK } from '../const'

export default function now(state={now: null}, action) {
  if (action.type === TICK) {
    return {now: action.now}
  }
  return state
}
