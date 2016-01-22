import { TICK } from '../const'

export default function now(state = null, action) {
  if (action.type === TICK) {
    return action.now
  }
  return state
}
