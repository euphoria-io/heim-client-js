import Immutable from 'immutable'
import _ from 'lodash'
import { UPDATE_LOCATION } from 'redux-simple-router'

import { EMBED_MESSAGE_RECEIVED } from '../const'

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

const initialRooms = [
  'music',
  'space',
  'welcome',
  'xkcd',
]

const initialState = {
  chats: _.reduce(initialRooms, (m, r) => m.set(r, new Chat(undefined, r)), Immutable.Map()),
  currentRoom: null,
}

export default function chatSwitch(state = initialState, action) {
  switch (action.type) {
    case EMBED_MESSAGE_RECEIVED:
      return { ...state, chats: Immutable.Map(state.chats.map((v, k) => [k, chat(v, action)]).toArray()) }
    case UPDATE_LOCATION:
      const loc = action.location || action.payload
      return updateLocation(state, loc)
    default:
      if (!action.roomName) {
        return state
      }
      let chatState = state.chats.get(action.roomName)
      if (!chatState) {
        chatState = new Chat()
        chatState.roomName = action.roomName
      }
      const chats = state.chats.set(action.roomName, chat(chatState, action))
      return { ...state, chats }
  }
}
