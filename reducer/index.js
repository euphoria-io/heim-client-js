import { combineReducers } from 'redux'

import chat from './chat'
import chatSwitch from './chatSwitch'
import now from './now'
import socketLog from './socketLog'

export default function rootReducer(externalState) {
  return combineReducers({
    ...externalState,
    chatSwitch,
    now,
    socketLog,
  })
}

export default rootReducer
