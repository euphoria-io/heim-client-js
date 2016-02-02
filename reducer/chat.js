import Immutable from 'immutable'
import _ from 'lodash'

import {
  EDIT_TEXT, EMBED_MESSAGE_RECEIVED, MOVE_CURSOR,
  WS_CONNECTING, WS_CONNECTED, WS_DISCONNECTED, WS_MESSAGE_RECEIVED, WS_MESSAGE_SENT,
} from '../const'

import Tree from '../lib/Tree'

const initialAuthState = {
  _failureReason: null,
  _pending: true,
  _required: false,
}

class Auth {
  constructor(value = initialAuthState) {
    Object.assign(this, value)
  }

  requested() {
    return new Auth({ ...this, _pending: true })
  }

  required() {
    return new Auth({ ...this, _pending: false, _required: true })
  }

  succeeded() {
    return new Auth({ ...this, _pending: false, _required: false })
  }

  failed(reason) {
    return new Auth({ ...this, _pending: false, _failureReason: reason })
  }
}

const initialEditorState = {
  parentId: null,
  selectionDirection: 'forward',
  selectionEnd: 0,
  selectionStart: 0,
  value: '',
}

class Editor {
  constructor(value = initialEditorState) {
    Object.assign(this, value)
  }

  move(state, dir, parentId) {
    switch (dir) {
      case 'top':
        return this.top()
      case 'up':
        return this.up(state.tree)
      case 'down':
        return this.down(state.tree)
      case 'left':
        return this.left(state.tree)
      default:
        if (parentId !== undefined) {
          return new Editor({ ...this, parentId })
        }
        return this
    }
  }

  top() {
    return new Editor({ ...this, parentId: null })
  }

  up(tree) {
    const msgId = tree.precedingParent(this.parentId)
    if (msgId !== null) {
      return new Editor({ ...this, parentId: msgId })
    }
    return this
  }

  down(tree) {
    return new Editor({ ...this, parentId: tree.nextParent(this.parentId) })
  }

  left(tree) {
    if (!this.parentId) {
      return this
    }
    const msg = tree.get(this.parentId)
    return new Editor({ ...this, parentId: msg.parent || null })
  }
}

export const initialChatState = {
  auth: new Auth(),
  editor: new Editor(),
  localStorage: Immutable.Map(),

  fetching: true,
  oldestDisplayedMsgId: null,
  oldestMsgId: null,

  nick: null,

  roomName: null,
  socketState: 'disconnected',
  tree: new Tree(),
  users: new Immutable.Map(),
}

export class Chat {
  constructor(value = initialChatState, roomName) {
    Object.assign(this, value)
    if (!!roomName) {
      this.roomName = roomName
    }
  }

  authRequired() {
    return this.auth._required
  }

  authPending() {
    return this.auth._pending
  }

  authFailureReason() {
    return this.auth._failureReason
  }

  setEditor(editor) {
    return new Chat({ ...this, editor: new Editor(editor) })
  }

  moveCursor(dir, msgId) {
    const editor = this.editor.move(this, dir, msgId)
    const paths = id => this.tree.paths.get(id, '').split('/')
    let touched = paths(this.editor.parentId)
    if (this.editor.parentId !== editor.parentId) {
      touched = touched.concat(paths(editor.parentId))
    }
    const tree = this.tree.touch(...touched)
    return new Chat({ ...this, editor, tree })
  }

  setSocketState(socketState) {
    return new Chat({ ...this, socketState })
  }

  addMessage(msg, forceDisplay = false) {
    let oldestMsgId = this.oldestMsgId
    if (!oldestMsgId || msg.id < oldestMsgId) {
      oldestMsgId = msg.id
    }
    let oldestDisplayedMsgId = this.oldestDisplayedMsgId
    if (forceDisplay && (!oldestDisplayedMsgId || msg.id < oldestDisplayedMsgId)) {
      oldestDisplayedMsgId = msg.id
    }
    let localStorage = this.localStorage
    const lastActive = localStorage.get('lastActive', 0)
    if (msg.time > lastActive) {
      localStorage = localStorage.set('lastActive', msg.time)
    }
    const tree = this.tree.addChild(msg)
    return new Chat({ ...this, localStorage, oldestDisplayedMsgId, oldestMsgId, tree })
  }

  addUser(sessionView) {
    const users = this.users.set(sessionView.session_id, sessionView)
    return new Chat({ ...this, users })
  }

  removeUser(sessionId) {
    const users = this.users.delete(sessionId)
    return new Chat({ ...this, users })
  }

  authReply({ success, reason }) {
    if (success) {
      return new Chat({ ...this, auth: this.auth.succeeded() })
    }
    return new Chat({ ...this, auth: this.auth.failed(reason) })
  }

  bounceEvent({ reason }) {
    if (reason === 'authentication required') {
      return new Chat({ ...this, auth: this.auth.required() })
    }
    // TODO: handle getting banned
    return this
  }

  logReply({ log }) {
    if (!log.length) {
      return new Chat({ ...this, fetching: false, complete: true })
    }
    const newChat = _.reduce(log, (c, v) => c.addMessage(v), this)
    return new Chat({ ...newChat, fetching: false })
  }

  snapshotEvent({ nick, listing, log }) {
    let newChat = _.reduce(listing, (c, v) => c.addUser(v), this)
    newChat = _.reduce(log, (c, v) => c.addMessage(v, true), newChat)
    const auth = newChat.auth.succeeded()
    return new Chat({ ...newChat, auth, nick, fetching: false })
  }

  messageReceived(packet) {
    switch (packet.type) {
      case 'auth-reply':
        return this.authReply(packet.data)
      case 'bounce-event':
        return this.bounceEvent(packet.data)
      case 'join-event':
        return this.addUser(packet.data)
      case 'log-reply':
        return this.logReply(packet.data)
      case 'part-event':
        return this.removeUser(packet.data.session_id)
      case 'send-event':
        return this.addMessage(packet.data)
      case 'send-reply':
        return this.addMessage(packet.data)
      case 'snapshot-event':
        return this.snapshotEvent(packet.data)
      default:
        return this
    }
  }

  messageSent({ type, data }) {
    switch (type) {
      case 'auth':
        let localStorage = this.localStorage
        if (data.type === 'passcode') {
          localStorage = localStorage.set('password', data.passcode)
        }
        return new Chat({ ...this, auth: this.auth.requested(), localStorage })
      case 'log':
        return new Chat({ ...this, fetching: true })
      case 'send':
        // TODO: maintain editor parent
        return new Chat({ ...this, editor: new Editor() })
      default:
        return this
    }
  }

  embedMessageReceived(data) {
    if (!data.id) {
      return this
    }
    const parts = data.id.split('/')
    if (parts.length < 2 || parts[0] !== this.roomName) {
      return this
    }
    const paths = id => this.tree.paths.get(id, '').split('/')
    console.log('invalidating', paths(parts[1]))
    const tree = this.tree.touch(...paths(parts[1]))
    return new Chat({ ...this, tree })
  }
}

export default function chatReducer(state = new Chat(), action) {
  let chat = state
  if (!(chat instanceof Chat)) {
    chat = new Chat(state)
  }
  switch (action.type) {
    case EDIT_TEXT:
      return chat.setEditor(action.editor)
    case EMBED_MESSAGE_RECEIVED:
      return chat.embedMessageReceived(action.data)
    case MOVE_CURSOR:
      return chat.moveCursor(action.dir, action.msgId)
    case WS_CONNECTING:
      return chat.setSocketState('connecting')
    case WS_CONNECTED:
      return chat.setSocketState('connected')
    case WS_DISCONNECTED:
      return chat.setSocketState('disconnected')
    case WS_MESSAGE_RECEIVED:
      return chat.messageReceived(action.packet)
    case WS_MESSAGE_SENT:
      return chat.messageSent(action.packet)
    default:
      return chat
  }
}
