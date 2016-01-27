import Immutable from 'immutable'
import { UPDATE_LOCATION } from 'redux-simple-router'

import chat, { Chat } from './chat'

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
    const chatState = new Chat()
    chatState.roomName = currentRoom
    chats = chats.set(currentRoom, chatState)
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
      let chatState = state.chats.get(action.roomName)
      if (!chatState) {
        chatState = new Chat()
        chatState.roomName = action.roomName
      }
      const chats = state.chats.set(action.roomName, chat(chatState, action))
      return { ...state, chats }
  }
}
