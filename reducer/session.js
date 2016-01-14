import { combineReducers } from 'redux'

import connection from './connection'
import keepalive from './keepalive'

const session = combineReducers({
  connection,
  keepalive,
})

export default session
