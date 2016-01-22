import Immutable from 'immutable'
import { UPDATE_LOCATION } from 'redux-simple-router'

import { WS_CONNECTING, WS_CONNECTED, WS_DISCONNECTED, WS_MESSAGE_RECEIVED, WS_MESSAGE_SENT } from '../const'

import Tree from '../lib/Tree'

const initialChatState = {
  fetching: true,
  oldestDisplayedMsgId: null,
  oldestMsgId: null,

  roomName: null,
  socketState: 'disconnected',
  tree: new Tree(),
  users: new Immutable.Map(),
}

function addMessage(state, msg, forceDisplay = false) {
  let oldestMsgId = state.oldestMsgId
  if (!oldestMsgId || msg.id < oldestMsgId) {
    oldestMsgId = msg.id
  }
  let oldestDisplayedMsgId = state.oldestDisplayedMsgId
  if (forceDisplay && (!oldestDisplayedMsgId || msg.id < oldestDisplayedMsgId)) {
    oldestDisplayedMsgId = msg.id
  }
  const tree = state.tree.addChild(msg)
  return { ...state, oldestDisplayedMsgId, oldestMsgId, tree }
}

function addUser(state, sessionView) {
  const users = state.users.set(sessionView.session_id, sessionView)
  return { ...state, users }
}

function removeUser(state, sessionId) {
  const users = state.users.delete(sessionId)
  return { ...state, users }
}

function messageSent(state, packet) {
  switch (packet.type) {
    case 'log':
      return { ...state, fetching: true }
    default:
      return state
  }
}

function messageReceived(state, packet) {
  let newState = state
  switch (packet.type) {
    case 'join-event':
      return addUser(state, packet.data)
    case 'log-reply':
      if (!packet.data.log.length) {
        return { ...state, fetching: false, complete: true }
      }
      for (let i = 0; i < packet.data.log.length; i++) {
        newState = addMessage(newState, packet.data.log[i])
      }
      return { ...newState, fetching: false }
    case 'part-event':
      return removeUser(state, packet.data.session_id)
    case 'send-event':
      return addMessage(state, packet.data)
    case 'send-reply':
      return addMessage(state, packet.data)
    case 'snapshot-event':
      for (let i = 0; i < packet.data.listing.length; i++) {
        newState = addUser(newState, packet.data.listing[i])
      }
      for (let i = 0; i < packet.data.log.length; i++) {
        newState = addMessage(newState, packet.data.log[i], true)
      }
      return { ...newState, fetching: false }
    default:
      return state
  }
}

function chat(state = initialChatState, action) {
  switch (action.type) {
    case WS_CONNECTING:
      return { ...state, socketState: 'connecting' }
    case WS_CONNECTED:
      return { ...state, socketState: 'connected' }
    case WS_DISCONNECTED:
      return { ...state, socketState: 'disconnected' }
    case WS_MESSAGE_RECEIVED:
      return messageReceived(state, action.packet)
    case WS_MESSAGE_SENT:
      return messageSent(state, action.packet)
    default:
      return state
  }
}

function updateLocation(state, loc) {
  if (!loc) {
    return state
  }
  const match = loc.pathname.match(/((pm:)?\w+)\/?$/)
  if (!match) {
    return state
  }
  const currentRoom = match[1]
  let chats = state.chats
  if (!state.chats.has(currentRoom)) {
    chats = chats.set(currentRoom, { ...initialChatState, roomName: currentRoom })
  }
  return { chats, currentRoom }
}

const initialState = {
  chats: Immutable.Map(),
  currentRoom: null,
}

export default function chatSwitch(state = initialState, action) {
  switch (action.type) {
    case UPDATE_LOCATION:
      const loc = action.location || action.payload
      return updateLocation(state, loc)
    default:
      const chatState = state.chats.get(
        action.roomName, { ...initialChatState, roomName: action.roomName })
      const chats = state.chats.set(action.roomName, chat(chatState, action))
      return { ...state, chats }
  }
  return state
}
