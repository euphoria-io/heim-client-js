import Immutable from 'immutable'

import { WS_MESSAGE_RECEIVED, WS_MESSAGE_SENT } from '../const'

const initialState = {
  pending: Immutable.Map(),
}

export default function keepalive(state=initialState, action) {
  switch (action.type) {
    case WS_MESSAGE_SENT:
      if (action.packet.id !== undefined) {
        return {pending: state.pending.set(action.packet.id, action.timestamp)}
      }
    case WS_MESSAGE_RECEIVED:
      if (action.packet.id !== undefined) {
        return {pending: state.pending.remove(action.packet.id), ...state}
      }
      return state
    default:
      return state
  }
}
