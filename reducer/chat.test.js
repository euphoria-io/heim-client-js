import Immutable from 'immutable'
import test from 'tape'

import chatSwitch from './chatSwitch'

import {
  EDIT_TEXT, MOVE_CURSOR,
  WS_CONNECTING, WS_CONNECTED, WS_DISCONNECTED, WS_MESSAGE_RECEIVED, WS_MESSAGE_SENT,
} from '../const'

test('chat', t => {
  let state
  const roomName = 'test'
  const auth = () => state.chats.get(roomName).auth
  const editor = () => state.chats.get(roomName).editor
  const users = () => state.chats.get(roomName).users
 
  const recvPacket = (type, data) => ({
    type: WS_MESSAGE_RECEIVED,
    roomName,
    packet: { type, data },
  })

  const sendPacket = (type, data) => ({
    type: WS_MESSAGE_SENT,
    roomName,
    packet: { type, data },
  })

  state = chatSwitch(undefined, { type: 'ignore', roomName })

  t.deepEqual(auth(), {
    failureReason: null,
    pending: true,
    required: false,
  })

  t.deepEqual(editor(), {
    parentId: null,
    selectionDirection: 'forward',
    selectionEnd: 0,
    selectionStart: 0,
    value: '',
  })

  t.equal(users(), Immutable.Map())

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

    const editText = editState => ({
      type: EDIT_TEXT,
      roomName,
      editor: { ...state.chats.get(roomName).editor, ...editState },
    })

    state = chatSwitch(state, editText({ selectionStart: 4, selectionEnd: 4, value: 'test' }))
    t.deepEqual(editor(), {
      parentId: 'A',
      selectionDirection: 'forward',
      selectionStart: 4,
      selectionEnd: 4,
      value: 'test',
    })

    state = chatSwitch(state, sendPacket('send'))
    t.deepEqual(editor(), {
      parentId: null,
      selectionDirection: 'forward',
      selectionStart: 0,
      selectionEnd: 0,
      value: '',
    })

    t.end()
  })

  t.test('chat users', t => {
    const sessionA = { session_id: 'A' }
    const sessionB = { session_id: 'B' }

    state = chatSwitch(state, recvPacket('join-event', sessionA))
    t.equal(users().get('A'), sessionA)
    t.equal(users().size, 1)

    state = chatSwitch(state, recvPacket('join-event', sessionB))
    t.equal(users().get('B'), sessionB)
    t.equal(users().size, 2)

    state = chatSwitch(state, recvPacket('part-event', sessionA))
    t.equal(users().get('A'), undefined)
    t.equal(users().size, 1)

    state = chatSwitch(state, recvPacket('part-event', sessionB))
    t.equal(users().size, 0)

    state = chatSwitch(state, recvPacket('snapshot-event', { listing: [ sessionA, sessionB ], log: [] }))
    t.equal(users().get('A'), sessionA)
    t.equal(users().get('B'), sessionB)
    t.equal(users().size, 2)

    t.end()
  })

  t.test('fetching status', t => {
    state = chatSwitch(undefined, { type: 'ignore', roomName })
    t.equal(state.chats.get(roomName).fetching, true)

    const snapshot = { listing: [], log: [] }
    state = chatSwitch(state, recvPacket('snapshot-event', snapshot))
    t.equal(state.chats.get(roomName).fetching, false)

    state = chatSwitch(state, sendPacket('log'))
    t.equal(state.chats.get(roomName).fetching, true)
    state = chatSwitch(state, recvPacket('log-reply', { log: [] }))
    t.equal(state.chats.get(roomName).fetching, false)

    state = chatSwitch(state, sendPacket('log'))
    t.equal(state.chats.get(roomName).fetching, true)
    state = chatSwitch(state, recvPacket('log-reply', { log: [ { id: 'A' } ] }))
    t.equal(state.chats.get(roomName).fetching, false)

    t.end()
  })

  t.test('auth state', t => {
    state = chatSwitch(undefined, { type: 'ignore', roomName })
    t.equal(auth().pending, true)

    const snapshot = { listing: [], log: [] }
    state = chatSwitch(state, recvPacket('snapshot-event', snapshot))
    t.equal(auth().pending, false)
    t.equal(auth().required, false)

    state = chatSwitch(state, recvPacket('bounce-event', { reason: 'test' }))
    t.equal(auth().required, false)
    state = chatSwitch(state, recvPacket('bounce-event', { reason: 'authentication required' }))
    t.equal(auth().required, true)

    state = chatSwitch(state, sendPacket('auth'))
    t.equal(auth().pending, true)
    t.equal(auth().required, true)

    state = chatSwitch(state, recvPacket('auth-reply', { success: false, reason: 'reason' }))
    t.equal(auth().pending, false)
    t.equal(auth().required, true)
    t.equal(auth().failureReason, 'reason')
    state = chatSwitch(state, recvPacket('auth-reply', { success: false, reason: 'reason2' }))
    t.equal(auth().failureReason, 'reason2')

    state = chatSwitch(state, recvPacket('auth-reply', { success: true }))
    t.equal(auth().required, false)

    t.end()
  })

  t.test('snapshot and log', t => {
    const keys = () => state.chats.get(roomName).tree.ready.sort().toArray()
    const oldestMsgId = () => state.chats.get(roomName).oldestMsgId
    const oldestDisplayedMsgId = () => state.chats.get(roomName).oldestDisplayedMsgId

    t.deepEqual(keys(), [])
    t.equal(oldestMsgId(), null)
    t.equal(oldestDisplayedMsgId(), null)

    const snapshot = {
      listing: [],
      log: [
        { id: '211', parent: '210' },
        { id: '300' },
        { id: '301', parent: '300' },
      ],
    }
    state = chatSwitch(state, recvPacket('snapshot-event', snapshot))
    t.deepEqual(keys(), ['300', '301'])
    t.equal(oldestMsgId(), '211')
    t.equal(oldestDisplayedMsgId(), '211')

    state = chatSwitch(state, recvPacket('log-reply', {
      log: [
        { id: '210', parent: '200' },
        { id: '101', parent: '100' },
      ],
    }))
    t.deepEqual(keys(), ['300', '301'])
    t.equal(oldestMsgId(), '101')
    t.equal(oldestDisplayedMsgId(), '211')

    state = chatSwitch(state, recvPacket('log-reply', {
      log: [
        { id: '200' },
      ],
    }))
    t.deepEqual(keys(), ['200', '210', '211', '300', '301'])
    t.equal(oldestMsgId(), '101')
    t.equal(oldestDisplayedMsgId(), '211')

    t.end()
  })
})
