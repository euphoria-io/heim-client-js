import { SEND_PACKET } from '../const'

export default class Backlog {
  constructor(store, roomName) {
    this.store = store
    this.roomName = roomName
    this.store.subscribe(() => this._onStore())
  }

  _onStore() {
    const state = this.store.getState()
    const chat = state.chatSwitch.chats.get(this.roomName)
    if (chat.fetching || chat.complete || !chat.oldestDisplayedMsgId) {
      return
    }
    if (chat.tree.needMore(chat.oldestDisplayedMsgId)) {
      this.fetchMore()
    }
  }

  fetchMore() {
    const state = this.store.getState()
    const chat = state.chatSwitch.chats.get(this.roomName)
    if (!chat.fetching && !chat.complete) {
      this.store.dispatch({
        type: SEND_PACKET,
        packet: {
          type: 'log',
          data: {
            before: chat.oldestMsgId,
            n: 100,
          },
        },
      })
    }
  }
}
