import Immutable from 'immutable'
import { UPDATE_LOCATION } from 'redux-simple-router'

import { WS_CONNECTING, WS_CONNECTED, WS_DISCONNECTED, WS_MESSAGE_RECEIVED, WS_MESSAGE_SENT } from '../const'

import Tree from '../lib/Tree'

const initialState = {
  chats: Immutable.Map(),
  currentRoom: null,
}

export default function chatSwitch(state=initialState, action) {
  switch (action.type) {
    case UPDATE_LOCATION:
      const match = action.location.pathname.match(/((pm:)?\w+)\/$/)
      if (!match) {
        return state
      } else {
        const currentRoom = match[1]
        let chats = state.chats
        if (!state.chats.has(currentRoom)) {
          chats = chats.set(currentRoom, {...initialChatState, roomName: currentRoom})
        }
        return {chats, currentRoom}
      }
    default:
      const chatState = state.chats.get(action.roomName, {...initialChatState, roomName: action.roomName})
      const chats = state.chats.set(action.roomName, chat(chatState, action))
      return {...state, chats}
  }
  return state
}

const initialChatState = {
  fetching: true,
  oldestMsgId: null,

  roomName: null,
  socketState: 'disconnected',
  tree: new Tree(),
  users: new Immutable.Map(),
}

function chat(state=initialChatState, action) {
  switch (action.type) {
    case WS_CONNECTING:
      return {...state, socketState: 'connecting'}
    case WS_CONNECTED:
      return {...state, socketState: 'connected'}
    case WS_DISCONNECTED:
      return {...state, socketState: 'disconnected'}
    case WS_MESSAGE_RECEIVED:
      return messageReceived(state, action.packet)
    case WS_MESSAGE_SENT:
      return messageSent(state, action.packet)
    default:
      return state
  }
}

function messageSent(state, packet) {
  switch (packet.type) {
    case 'log':
      return {...state, fetching: true}
    default:
      return state
  }
}

function messageReceived(state, packet) {
  switch (packet.type) {
    case 'join-event':
      return addUser(state, packet.data)
    case 'log-reply':
      if (!packet.data.log) {
        return {...state, fetching: false, complete: true}
      }
      for (var i = 0; i < packet.data.log.length; i++) {
        state = addMessage(state, packet.data.log[i])
      }
      return {...state, fetching: false}
    case 'part-event':
      return removeUser(state, packet.data.session_id)
    case 'send-event':
      return addMessage(state, packet.data)
    case 'send-reply':
      return addMessage(state, packet.data)
    case 'snapshot-event':
      for (var i = 0; i < packet.data.listing.length; i++) {
        state = addUser(state, packet.data.listing[i])
      }
      for (var i = 0; i < packet.data.log.length; i++) {
        state = addMessage(state, packet.data.log[i], true)
      }
      return {...state, fetching: false}
    default:
      return state
  }
}

function addMessage(state, msg, greedy=false) {
  let oldestMsgId = state.oldestMsgId
  if (!oldestMsgId || msg.id < oldestMsgId) {
    oldestMsgId = msg.id
  }
  const tree = state.tree.addChild(msg.parent, msg.id, msg, greedy)
  return {...state, oldestMsgId, tree}
}

function addUser(state, sessionView) {
  const users = state.users.set(sessionView.session_id, sessionView)
  return {...state, users}
}

function removeUser(state, sessionId) {
  const users = state.users.delete(sessionId)
  return {...state, users}
}
