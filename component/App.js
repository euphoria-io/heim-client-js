import React, { Component, PropTypes } from 'react'
import { Provider, connect } from 'react-redux'
import { IndexRoute, Route, Router, RouterContext } from 'react-router'

import Socket from '../lib/Socket'

import ChatRoom from './ChatRoom'
import Home from './Home'

class App extends Component {
  render() {
    return (
      <div>
        {this.props.children && React.cloneElement(this.props.children, {ws: this.props.ws})}
      </div>
    )
  }
}

App.propTypes = {
  ws: PropTypes.instanceOf(Socket).isRequired,
}

App.view = function(history, store, ws) {
  let bindSocket = (Component, props) => {
    return <Component ws={ws} {...props} />
  }

  return (
    <Provider store={store}>
      <Router history={history} createElement={bindSocket}>
        <Route path="/" component={App}>
          <IndexRoute component={Home} />
          <Route path="/room/:roomName" component={ChatRoom} />
        </Route>
      </Router>
    </Provider>
  )
}

function select(state) {
  return state
}

export default connect(select)(App)
