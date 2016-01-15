import React from 'react'
import { browserHistory, createMemoryHistory } from 'react-router'

import App from './component/App'

import Socket from './lib/Socket'

import renderStaticPage from './site/server'
import newStore from './site/store'

const inBrowser = typeof document !== 'undefined'
const history = inBrowser ? browserHistory : createMemoryHistory()

const store = newStore(history)
const ws = new Socket(store, 'https://euphoria.io', 'xkcd')
const view = App.view(history, store, ws)

if (inBrowser) {
  require('style!./css/main.less')
  require('./site/client').default(store, view)
}

export default function renderPage(locals, callback) {
  require('./css/main.less')
  return renderStaticPage(store, view, locals, callback)
}
