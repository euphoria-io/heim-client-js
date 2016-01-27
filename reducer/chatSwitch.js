import Immutable from 'immutable'
import { UPDATE_LOCATION } from 'redux-simple-router'

import chat, { initialChatState } from './chat'

function updateLocation(state, loc) {
  if (!loc) {
    return state
  }
  const match = loc.pathname.match(/^\/room\/((pm:)?\w+)\/?$/)
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
}
