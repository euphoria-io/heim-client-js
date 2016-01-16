import Immutable from 'immutable'

import { WS_MESSAGE_RECEIVED, WS_MESSAGE_SENT } from '../const'

export default function socketLog(state={log: Immutable.List()}, action) {
  if (action.type === WS_MESSAGE_RECEIVED || action.type === WS_MESSAGE_SENT) {
    const { packet, roomName } = action
    console.log(roomName+':', packet.type+':', packet.data)
  }
  return {log: state.log.push(action)}
}
