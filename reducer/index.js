import { combineReducers } from 'redux'

import chatSwitch from './chatSwitch'
import now from './now'
import rooms from './rooms'
import socketLog from './socketLog'

export default function rootReducer(externalState) {
  return combineReducers({
    ...externalState,
    chatSwitch,
    now,
    rooms,
    socketLog,
  })
}

export default rootReducer
