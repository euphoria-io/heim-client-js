import { combineReducers } from 'redux'

import chat from './chat'
import session from './session'
import socketLog from './socketLog'

export default function rootReducer(externalState) {
  return combineReducers({
    ...externalState,
    chat,
    session,
    socketLog,
  })
}

export default rootReducer
