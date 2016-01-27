import Immutable from 'immutable'

import {
  EDIT_TEXT, MOVE_CURSOR,
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
    return new Auth({ ...this, _required: true })
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
    return new Editor({ ...this, parentId: tree.nextParent(this.parentId)})
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
  constructor(value = initialChatState) {
    Object.assign(this, value)
  }

  setEditor(editor) {
    return new Chat({ ...this, editor })
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
    const tree = this.tree.addChild(msg)
    return new Chat({ ...this, oldestDisplayedMsgId, oldestMsgId, tree })
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
    let chat = this
    for (let i = 0; i < log.length; i++) {
      chat = chat.addMessage(log[i])
    }
    return new Chat({ ...chat, fetching: false })
  }

  snapshotEvent({ nick, listing, log }) {
    let chat = this
    for (let i = 0; i < listing.length; i++) {
      chat = chat.addUser(listing[i])
    }
    for (let i = 0; i < log.length; i++) {
      chat = chat.addMessage(log[i], true)
    }
    const auth = chat.auth.succeeded()
    return new Chat({ ...chat, auth, nick, fetching: false })
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

  messageSent({ type }) {
    switch (type) {
      case 'auth':
        return new Chat({ ...this, auth: this.auth.requested() })
      case 'log':
        return new Chat({ ...this, fetching: true })
      case 'send':
        // TODO: maintain editor parent
        return new Chat({ ...this, editor: new Editor() })
      default:
        return this
    }
  }
}

export default function chat(state = new Chat(), action) {
  switch (action.type) {
    case EDIT_TEXT:
      return state.setEditor(action.editor)
    case MOVE_CURSOR:
      return state.moveCursor(action.dir, action.msgId)
    case WS_CONNECTING:
      return state.setSocketState('connecting')
    case WS_CONNECTED:
      return state.setSocketState('connected')
    case WS_DISCONNECTED:
      return state.setSocketState('disconnected')
    case WS_MESSAGE_RECEIVED:
      return state.messageReceived(action.packet)
    case WS_MESSAGE_SENT:
      return state.messageSent(action.packet)
    default:
      return state
  }
}
