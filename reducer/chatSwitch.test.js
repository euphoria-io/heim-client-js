import Immutable from 'immutable'
import { UPDATE_LOCATION } from 'redux-simple-router'
import test from 'tape'

import chatSwitch from './chatSwitch'

test('chatSwitch currentRoom', t => {
  const update = (path, key = 'location') => {
    const action = { type: UPDATE_LOCATION }
    action[key] = { pathname: path }
    return action
  }

  let state = chatSwitch(undefined, { type: 'ignore', roomName: 'ignore' })
  t.equal(state.currentRoom, null)
  t.deepEqual(state.chats.keySeq().toArray(), ['ignore'])

  t.equal(chatSwitch(state, update('/room/test/', 'ignore')), state)

  state = chatSwitch(state, update('/room/test/'))
  t.equal(state.currentRoom, 'test')

  state = chatSwitch(state, update('/room/test2/', 'payload'))
  t.equal(state.currentRoom, 'test2')

  const before = state.chats.get('test')
  state = chatSwitch(state, update('/room/test/'))
  t.equal(state.currentRoom, 'test')
  t.equal(state.chats.get('test'), before)

  state = chatSwitch(state, update('/room/'))
  t.equal(state.currentRoom, 'test')

  t.end()
})
