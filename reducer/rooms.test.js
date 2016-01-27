import Immutable from 'immutable'
import test from 'tape'

import { WS_MESSAGE_RECEIVED } from '../const'

import rooms from './rooms'

test('rooms', t => {
  const packet = (roomName, type, data) => ({ type: WS_MESSAGE_RECEIVED, roomName, packet: { type, data } })

  let state = rooms(undefined, packet('A', 'send-event', { time: 1 }))
  t.equal(state.get('A').get('lastActive'), 1)

  const snapshot = {
    log: [
      { time: 2 },
      { time: 0 },
      { time: 1 },
    ],
  }
  state = rooms(state, packet('A', 'snapshot-event', snapshot))
  t.equal(state.get('A').get('lastActive'), 2)
  t.equal(rooms(state, packet('A', 'snapshot-event', { log: [] })), state)

  t.equal(rooms(state, packet('A', 'ignore')), state)
  t.equal(rooms(state, { type: 'ignore' }), state)

  t.end()
})
