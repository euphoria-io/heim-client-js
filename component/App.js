import React, { Component, PropTypes } from 'react'
import { Provider, connect } from 'react-redux'
import { IndexRoute, Route, Router } from 'react-router'

import SocketSwitch from '../lib/SocketSwitch'

import ChatRoom from './ChatRoom'
import Home from './Home'

class App extends Component {
  static view(history, store, socketSwitch) { // eslint-disable-line react/sort-comp
    const bindSocket = (Component, props) => { // eslint-disable-line no-shadow
      const { params } = props
      const { roomName } = params
      return <Component roomName={roomName} socketSwitch={socketSwitch} {...props} />
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

  componentDidMount() {
    const { roomName } = this.props
    this.props.socketSwitch.select(roomName)
  }

  componentWillReceiveProps(props) {
    this.props.socketSwitch.select(props.roomName)
  }

  render() {
    return (
      <div>
        {this.props.children && React.cloneElement(this.props.children)}
      </div>
    )
  }
}

App.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  params: PropTypes.object,
  roomName: PropTypes.string,
  socketSwitch: PropTypes.instanceOf(SocketSwitch).isRequired,
}

function select(state) {
  return state
}

export default connect(select)(App)
