import { WS_MESSAGE_RECEIVED } from '../const'
import Tree from '../lib/Tree'

const initialState = {
  tree: new Tree(),
}

export default function chat(state=initialState, action) {
  if (action.type !== WS_MESSAGE_RECEIVED) {
    return state
  }
  const packet = action.packet
  switch (packet.type) {
    case 'send-event':
      return addMessage(state, packet.data)
    case 'send-reply':
      return addMessage(state, packet.data)
    case 'snapshot-event':
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
  return {tree}
}
