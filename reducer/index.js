import { combineReducers } from 'redux'

import chat from './chat'
import session from './session'
import socketLog from './socketLog'

const rootReducer = combineReducers({
  chat,
  session,
  socketLog,
})

export default rootReducer
