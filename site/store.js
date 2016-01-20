import { applyMiddleware, createStore } from 'redux'
import { syncHistory, routeReducer } from 'redux-simple-router'
import thunk from 'redux-thunk'

import rootReducer from '../reducer'

export default function newStore(history, initialState) {
  const reducer = rootReducer({ routing: routeReducer })
  let csm = applyMiddleware(thunk)(createStore)
  const rrm = syncHistory(history)
  csm = applyMiddleware(rrm)(csm)
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
