import React, { PropTypes } from 'react'
import { Provider } from 'react-redux'
import { browserHistory, createMemoryHistory, IndexRoute, Route, Router } from 'react-router'

import App from './component/App'
import ChatRoom from './component/ChatRoom'
import Home from './component/Home'
import RoomList from './component/RoomList'

import Clock from './lib/Clock'
import SocketSwitch from './lib/SocketSwitch'

import renderStaticPage from './site/server'
import newStore from './site/store'

const inBrowser = typeof document !== 'undefined'
const history = inBrowser ? browserHistory : createMemoryHistory()

const store = newStore(history)
const socketSwitch = new SocketSwitch(store, 'https://euphoria.io')

const bindSocket = (Component, props) => { // eslint-disable-line no-shadow
  const { params } = props
  const { roomName } = params
  return <Component roomName={roomName} socketSwitch={socketSwitch} {...props} />
}

bindSocket.propTypes = {
  params: PropTypes.object,
}

const view = (
  <Provider store={store}>
    <Router history={history} createElement={bindSocket}>
      <Route path="/" component={App}>
        <IndexRoute components={{ content: Home }} />
        <Route path="/room/:roomName" components={{ content: ChatRoom, sidebar: RoomList }} />
      </Route>
    </Router>
  </Provider>
)

if (inBrowser) {
  new Clock(store) // eslint-disable-line no-new
  require('style!./css/main.less')
  require('./site/client').default(store, view)
}

export default function renderPage(locals, callback) {
  require('./css/main.less')
  return renderStaticPage(store, view, locals, callback)
}
