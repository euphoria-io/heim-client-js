import Immutable from 'immutable'
import _ from 'lodash'

import {
  EDIT_TEXT, EMBED_MESSAGE_RECEIVED, MOVE_CURSOR, TOGGLE_ROOM_SIDEBAR,
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
      case 'right':
        return this.top()
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
    const msgId = tree.precedingParent(this.parentId || null)
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

  getLocalStorage(key, defaultValue) {
    return this.localStorage.get(key, defaultValue)
  }

  setLocalStorage(key, value) {
    const localStorage = this.localStorage.set(key, value)
    return new Chat({ ...this, localStorage })
  }

  isUserListDisplayed() {
    return this.getLocalStorage('displayUserList', false)
  }

  toggleRoomSidebar() {
    return this.setLocalStorage('displayUserList', !this.getLocalStorage('displayUserList', false))
  }

  userGroups() {
    return this.users.groupBy(v => /^bot:/.test(v.id) ? 'bots' : 'people')
  }

  userList() {
    const groups = this.userGroups()
    const total = groups.reduce((sum, group) => sum + group.size, 0)
    return { groups, total }
  }

  setEditor(editor) {
    let value = editor
    if (!(value instanceof Editor)) {
      value = new Editor(value)
    }
    return this.touchEditor(value)
  }

  touchEditor(newEditor) {
    const paths = id => this.tree.paths.get(id, '').split('/')
    let touched = paths(this.editor.parentId)
    if (this.editor.parentId !== newEditor.parentId) {
      touched = touched.concat(paths(newEditor.parentId))
    }
    const tree = this.tree.touch(...touched)
    return new Chat({ ...this, editor: newEditor, tree })
  }

  visit(now = undefined) {
    return this.setLocalStorage('lastVisited', now || new Date())
  }

  moveCursor(dir, msgId) {
    return this.setEditor(this.editor.move(this, dir, msgId))
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

  messageReceived({ type, data }) {
    switch (type) {
      case 'auth-reply':
        return this.authReply(data)
      case 'bounce-event':
        return this.bounceEvent(data)
      case 'join-event':
        return this.addUser(data)
      case 'log-reply':
        return this.logReply(data)
      case 'part-event':
        return this.removeUser(data.session_id)
      case 'send-event':
        return this.addMessage(data)
      case 'send-reply':
        return this
          .addMessage(data)
          .setEditor({ ...this.editor, parentId: data.parent || data.id })
      case 'snapshot-event':
        return this.snapshotEvent(data)
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
        return this.setEditor({ ...initialEditorState, parentId: this.editor.parentId })
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
    case TOGGLE_ROOM_SIDEBAR:
      return chat.toggleRoomSidebar()
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
