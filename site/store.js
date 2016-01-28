import Immutable from 'immutable'
import _ from 'lodash'
import { applyMiddleware, createStore } from 'redux'
import { routeReducer, syncHistory } from 'redux-simple-router'
import storage, { decorators } from 'redux-storage'
import createEngine from 'redux-storage/engines/localStorage'
import thunk from 'redux-thunk'

import { WS_MESSAGE_RECEIVED, WS_MESSAGE_SENT } from '../const'

import socketMiddleware from '../middleware/socketMiddleware'

import rootReducer, { Chat } from '../reducer'

class StorageFilter {
  constructor(engine) {
    this.engine = engine
  }

  load() {
    return this.engine.load().then(roomStorages => {
      if (!roomStorages || !roomStorages.rooms) {
        return {}
      }
      const initialChat = new Chat()
      const reducer = (cs, data, key) => cs.set(key, new Chat({ ...initialChat, localStorage: data, roomName: key }))
      return {
        chatSwitch: {
          chats: roomStorages.rooms.reduce(reducer, Immutable.Map()),
        },
      }
    })
  }

  save(state) {
    if (!state.chatSwitch || !state.chatSwitch.chats) {
      return this.engine.save({})
    }
    const roomStorages = state.chatSwitch.chats.reduce(
      (cs, data, key) => cs.set(key, data.localStorage), Immutable.Map())
    return this.engine.save({ rooms: roomStorages })
  }
}

export default function newStore(history, initialState) {
  let engine
  const rrm = syncHistory(history)

  const middleware = [
    socketMiddleware('https://euphoria.io'), // must come before rrm
    rrm,
    thunk,
  ]

  if (typeof window !== 'undefined') {
    engine = createEngine('heim')
    engine = decorators.immutablejs(engine, [
      ['rooms'],
    ])
    engine = new StorageFilter(engine)
    engine = decorators.debounce(engine, 200)
    middleware.unshift(storage.createMiddleware(engine, [], [WS_MESSAGE_RECEIVED, WS_MESSAGE_SENT]))
  }

  let reducer = rootReducer({ routing: routeReducer })
  reducer = storage.reducer(reducer)

  const csm = _.reduce(middleware, (f, mw) => applyMiddleware(mw)(f), createStore)
  const store = csm(reducer, initialState)

  if (engine) {
    const load = storage.createLoader(engine)
    load(store)
  }

  rrm.listenForReplays(store)

  if (module.hot) {
    module.hot.accept('../reducer', () => {
      const nextReducer = require('../reducer').default
      store.replaceReducer(nextReducer)
    })
  }

  return store
}
