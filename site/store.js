import _ from 'lodash'
import { applyMiddleware, createStore } from 'redux'
import { syncHistory, routeReducer } from 'redux-simple-router'
import thunk from 'redux-thunk'

import rootReducer from '../reducer'

export default function newStore(history, initialState) {
  const rrm = syncHistory(history)
  const middleware = [
    thunk,
    rrm,
  ]

  const csm = _.reduce(middleware, (f, mw) => applyMiddleware(mw)(f), createStore)
  const reducer = rootReducer({ routing: routeReducer })
  const store = csm(reducer, initialState)

  rrm.listenForReplays(store)

  if (module.hot) {
    module.hot.accept('../reducer', () => {
      const nextReducer = require('../reducer').default
      store.replaceReducer(nextReducer)
    })
  }

  return store
}
