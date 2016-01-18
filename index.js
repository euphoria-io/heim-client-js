import React from 'react'
import { browserHistory, createMemoryHistory } from 'react-router'

import App from './component/App'

import Clock from './lib/Clock'
import SocketSwitch from './lib/SocketSwitch'

import renderStaticPage from './site/server'
import newStore from './site/store'

const inBrowser = typeof document !== 'undefined'
const history = inBrowser ? browserHistory : createMemoryHistory()

const store = newStore(history)
const socketSwitch = new SocketSwitch(store, 'https://euphoria.io')
const view = App.view(history, store, socketSwitch)

if (inBrowser) {
  new Clock(store)
  require('style!./css/main.less')
  require('style!./css/emoji.emoji-less')
  require('./site/client').default(store, view)
}

export default function renderPage(locals, callback) {
  require('./css/main.less')
  return renderStaticPage(store, view, locals, callback)
}
