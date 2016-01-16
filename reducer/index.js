import { combineReducers } from 'redux'

import chat from './chat'
import chatSwitch from './chatSwitch'
import socketLog from './socketLog'

export default function rootReducer(externalState) {
  return combineReducers({
    ...externalState,
    chatSwitch,
    socketLog,
  })
}

export default rootReducer
