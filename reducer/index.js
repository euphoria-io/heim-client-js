import { combineReducers } from 'redux'

import chatSwitch from './chat'
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
