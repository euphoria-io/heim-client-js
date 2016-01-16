import Immutable from 'immutable'

import { WS_CONNECTING, WS_CONNECTED, WS_DISCONNECTED, WS_MESSAGE_RECEIVED } from '../const'

export default function chat(state=initialState, action) {
  switch (action.type) {
    case WS_CONNECTING:
      return {...state, socketState: 'connecting'}
    case WS_CONNECTED:
      return {...state, socketState: 'connected'}
    case WS_DISCONNECTED:
      return {...state, socketState: 'disconnected'}
    case WS_MESSAGE_RECEIVED:
      return messageReceived(state, action.packet)
    default:
      return state
  }
}

function messageReceived(state, packet) {
  switch (packet.type) {
    case 'join-event':
      return addUser(state, packet.data)
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
        state = addMessage(state, packet.data.log[i])
      }
      return state
    default:
      return state
  }
}

function addMessage(state, msg) {
  const tree = state.tree.addChild(msg.parent, msg.id, msg)
  return {...state, tree}
}

function addUser(state, sessionView) {
  const users = state.users.set(sessionView.session_id, sessionView)
  return {...state, users}
}

function removeUser(state, sessionId) {
  const users = state.users.delete(sessionId)
  return {...state, users}
}
