import Immutable from 'immutable'

import Socket from './Socket'

const MAX_CONN = 3

export default class SocketSwitch {
  constructor(store, endpoint) {
    this.store = store
    this.endpoint = endpoint
    this._socks = Immutable.Map()
    this._retired = Immutable.Map()
    this._selectTimes = Immutable.Map()
    this._selected = null
  }

  select(roomName) {
    if (!roomName) {
      return null
    }

    if (this._selected && this._selected.roomName === roomName) {
      return null
    }

    let sock = this.get(roomName)
    if (!sock) {
      sock = this._add(roomName)
    }

    this._selected = sock
    this._selectTimes[sock.roomName] = new Date()
    return sock
  }

  current() {
    return this._selected
  }

  get(roomName) {
    return this._socks.get(roomName)
  }

  _add(roomName) {
    while (this._socks.size >= MAX_CONN) {
      const oldest = this._socks.minBy(sock => this._selectTimes[sock.roomName])
      this._socks = this._socks.delete(oldest.roomName)
      this._retired = this._retired.set(oldest.roomName, oldest)
    }

    let sock = this._retired.get(roomName)
    if (sock) {
      this._retired = this._retired.delete(sock.roomName)
    } else {
      sock = new Socket(this.store, this.endpoint, roomName)
      sock.connect()
    }
    this._socks = this._socks.set(sock.roomName, sock)
    return sock
  }
}
