import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from '../reducer'

export default function newStore(initialState) {
  const store = applyMiddleware(thunk)(createStore)(rootReducer, initialState)

  if (module.hot) {
    module.hot.accept('../reducer', () => {
      const nextReducer = require('../reducer').default
      store.replaceReducer(nextReducer)
    })
  }

  return store
}
