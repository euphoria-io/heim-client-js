import Immutable from 'immutable'

import { UPDATE_LOCATION } from 'redux-simple-router'

import Tree from '../lib/Tree'

import chat from './chat'

const initialState = {
  chats: Immutable.Map(),
  currentRoom: null,
}

const initialChatState = {
  roomName: null,
  socketState: 'disconnected',
  tree: new Tree(),
  users: new Immutable.Map(),
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
