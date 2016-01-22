import Immutable from 'immutable'
import _ from 'lodash'

import { WS_MESSAGE_RECEIVED } from '../const'

function roomActive(state, roomName, lastActive) {
  const roomState = state.get(roomName, Immutable.Map())
  return state.set(roomName, roomState.set('lastActive', lastActive))
}

function messageReceived(state, roomName, packet) {
  switch (packet.type) {
    case 'send-event':
      return roomActive(state, roomName, packet.data.time)
    case 'snapshot-event':
      const latest = _.maxBy(packet.data.log, msg => msg.time)
      if (latest) {
        const newState = roomActive(state, roomName, latest.time)
        return newState
      }
      return state
    default:
      return state
  }
}

export default function rooms(state = Immutable.Map(), action) {
  switch (action.type) {
    case WS_MESSAGE_RECEIVED:
      return messageReceived(state, action.roomName, action.packet)
    default:
      return state
  }
}
