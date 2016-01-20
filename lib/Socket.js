import url from 'url'

import { WS_CONNECTING, WS_CONNECTED, WS_DISCONNECTED, WS_MESSAGE_RECEIVED, WS_MESSAGE_SENT } from '../const'

export default class Socket {
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
