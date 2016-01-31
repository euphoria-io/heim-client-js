import Immutable from 'immutable'

import { EMBED_MESSAGE_RECEIVED } from '../const'

const initialState = {
  width: Immutable.Map(),
}

class EmbedState {
  constructor(value = initialState) {
    Object.assign(this, value)
  }

  onMessage(msg) {
    if (!msg || !msg.id) {
      return this
    }

    const id = msg.id

    switch (msg.type) {
      case 'size':
        console.log('setting width of', id, 'to', msg.data)
        return new EmbedState({ ...this, width: this.width.set(id, msg.data.width) })
      default:
        return this
    }
  }
}

export default function embed(state = new EmbedState(), action) {
  switch (action.type) {
    case EMBED_MESSAGE_RECEIVED:
      return state.onMessage(action.data)
    default:
      return state
  }
}
