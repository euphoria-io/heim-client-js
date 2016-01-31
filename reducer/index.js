import { combineReducers } from 'redux'

import chatSwitch from './chatSwitch'
import embed from './embed'
import now from './now'
import socketLog from './socketLog'

export default function rootReducer(externalState) {
  return combineReducers({
    ...externalState,
    chatSwitch,
    embed,
    now,
    socketLog,
  })
}

export { Chat } from './chat'
