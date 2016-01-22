import Immutable from 'immutable'
import { UPDATE_LOCATION } from 'redux-simple-router'
import url from 'url'

import {
  SELECT_ROOM,
  SEND_PACKET,
  WS_CONNECTING,
  WS_CONNECTED,
  WS_DISCONNECTED,
  WS_MESSAGE_RECEIVED,
  WS_MESSAGE_SENT,
} from '../const'

const MAX_CONN = 10

class Socket {
  constructor(store, endpoint, roomName) {
    this.store = store
    this._endpoint = url.parse(endpoint)
    this.roomName = roomName
    this.ws = null
    this._nextId = 1
  }

  connect() {
    if (this.ws) {
      this.ws.close()
    }

    if (typeof WebSocket === 'undefined') {
      return
    }

    this._dispatch(WS_CONNECTING)

    const wsurl = this._url()
    this.ws = new WebSocket(wsurl, 'heim1')
    this.ws.onopen = this._onOpen.bind(this)
    this.ws.onclose = this._onClose.bind(this)
    this.ws.onmessage = this._onMessage.bind(this)
  }

  send(id, type, data) {
    let msgId = id ? '' + id : null
    if (!id && !/-reply$/.test(type)) {
      msgId = '' + this._nextId++
    }
    const packet = {
      id: msgId,
      type,
      data,
    }
    this._dispatch(WS_MESSAGE_SENT, { packet })
    this.ws.send(JSON.stringify(packet))
  }

  _dispatch(type, data) {
    this.store.dispatch({
      type,
      roomName: this.roomName,
      ...data,
    })
  }

  _url() {
    let scheme = 'ws'
    if (this._endpoint.protocol === 'https') {
      scheme = 'wss'
    }
    return scheme + '://' + this._endpoint.host + '/room/' + this.roomName + '/ws?h=1'
  }

  _onOpen() {
    this._dispatch(WS_CONNECTED)
  }

  _onClose() {
    this.ws.onopen = this.ws.onclose = this.ws.onmessage = null
    this._dispatch(WS_DISCONNECTED)
  }

  _onMessage(ev) {
    this._dispatch(WS_MESSAGE_RECEIVED, { packet: JSON.parse(ev.data) })
    const packet = JSON.parse(ev.data)
    if (packet.type === 'ping-event') {
      this.send(null, 'ping-reply', packet.data)
    }
  }
}

class SocketSwitch {
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

  sendPacket(roomName, packet) {
    const sock = this.get(roomName)
    if (!sock) {
      // log error?
      return
    }
    sock.send(packet.id, packet.type, packet.data)
  }

  selectFromPath(path) {
    const match = path.match(/((pm:)?\w+)\/?$/)
    if (match) {
      this.select(match[1])
    }
  }
}

export default function socketMiddleware(endpoint) {
  return store => {
    const socketSwitch = new SocketSwitch(store, endpoint)

    return next => action => {
      const result = next(action)

      switch (action.type) {
        case SELECT_ROOM:
          socketSwitch.select(action.roomName)
          break
        case UPDATE_LOCATION:
          const loc = action.location || action.payload
          socketSwitch.selectFromPath(loc.pathname)
          break
        case SEND_PACKET:
          socketSwitch.sendPacket(action.roomName, action.packet)
          break
        default:
          break
      }

      return result
    }
  }
}
