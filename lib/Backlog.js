export default class Backlog {
  constructor(socketSwitch, roomName) {
    this.socketSwitch = socketSwitch
    this.roomName = roomName

    this.store = socketSwitch.store
    this.store.subscribe(() => this._onStore())
  }

  _onStore() {
    const state = this.store.getState()
    const chat = state.chatSwitch.chats.get(this.roomName)
    if (!chat.fetching && !chat.complete && chat.oldestDisplayedMsgId && chat.tree.needMore(chat.oldestDisplayedMsgId)) {
      this.fetchMore()
    }
  }

  fetchMore() {
    const state = this.store.getState()
    const chat = state.chatSwitch.chats.get(this.roomName)
    if (!chat.fetching && !chat.complete) {
      const socket = this.socketSwitch.get(this.roomName)
      socket.send(null, 'log', {before: chat.oldestMsgId, n: 100})
    }
  }
}
