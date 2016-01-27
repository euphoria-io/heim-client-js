import Immutable from 'immutable'
import { UPDATE_LOCATION } from 'redux-simple-router'
import test from 'tape'

import chatSwitch from './chat'

import {
  EDIT_TEXT, MOVE_CURSOR,
  WS_CONNECTING, WS_CONNECTED, WS_DISCONNECTED, WS_MESSAGE_RECEIVED, WS_MESSAGE_SENT,
} from '../const'

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

  t.end()
})

test('chat', t => {
  let state
  const roomName = 'test'
  const editor = () => state.chats.get(roomName).editor
 
  state = chatSwitch(undefined, { type: 'ignore', roomName })
  t.deepEqual(editor(), {
    parentId: null,
    selectionDirection: 'forward',
    selectionEnd: 0,
    selectionStart: 0,
    value: '',
  })

  t.test('chat editor', t => {
    const addMessage = (parentId, msgId) => {
      state = chatSwitch(state, {
        type: WS_MESSAGE_RECEIVED,
        roomName,
        packet: {
          type: 'send-event',
          data: {
            parent: parentId,
            id: msgId,
          },
        },
      })
    }
    addMessage(null, 'A')
    addMessage(null, 'B')
    addMessage('B', 'BA')
    addMessage('BA', 'BAA')
    addMessage('BA', 'BAB')
    addMessage('B', 'BB')
    addMessage(null, 'C')
    t.equal(state.chats.get(roomName).tree.messages.size, 7)

    const moveCursor = (dir, msgId) => ({ type: MOVE_CURSOR, roomName, dir, msgId })

    const before = editor()
    state = chatSwitch(state, moveCursor('nowhere'))
    t.equal(editor(), before)

    state = chatSwitch(state, moveCursor('up'))
    t.equal(editor().parentId, 'C')
    state = chatSwitch(state, moveCursor('up'))
    t.equal(editor().parentId, 'B')
    state = chatSwitch(state, moveCursor('up'))
    t.equal(editor().parentId, 'BB')

    state = chatSwitch(state, moveCursor('left'))
    t.equal(editor().parentId, 'B')
    state = chatSwitch(state, moveCursor('left'))
    t.equal(editor().parentId, null)
    state = chatSwitch(state, moveCursor('left'))
    t.equal(editor().parentId, null)

    state = chatSwitch(state, moveCursor(undefined, 'BAA'))
    t.equal(editor().parentId, 'BAA')

    state = chatSwitch(state, moveCursor('down'))
    t.equal(editor().parentId, 'BAB')
    state = chatSwitch(state, moveCursor('down'))
    t.equal(editor().parentId, 'BA')

    state = chatSwitch(state, moveCursor('top'))
    t.equal(editor().parentId, null)
    state = chatSwitch(state, moveCursor('down'))
    t.equal(editor().parentId, null)

    state = chatSwitch(state, moveCursor(undefined, 'A'))
    t.equal(editor().parentId, 'A')
    state = chatSwitch(state, moveCursor('up'))
    t.equal(editor().parentId, 'A')

    t.end()
  })

})
