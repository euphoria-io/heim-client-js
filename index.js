import React from 'react'
import { Provider } from 'react-redux'

import App from './component/App'

import Socket from './lib/Socket'

import renderStaticPage from './site/server'
import newStore from './site/store'

const store = newStore()
const ws = new Socket(store, 'https://euphoria.io', 'xkcd')

const view = (
  <Provider store={store}>
    <App ws={ws} />
  </Provider>
)

if (typeof document !== 'undefined') {
  require('style!./css/main.less')
  require('./site/client').default(store, view)
}

export default function renderPage(locals, callback) {
  require('./css/main.less')
  return renderStaticPage(store, view, locals, callback)
}
