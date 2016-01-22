import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { routeActions } from 'redux-simple-router'

import SocketSwitch from '../lib/SocketSwitch'

class App extends Component {
  componentDidMount() {
    const { roomName } = this.props
    this.props.socketSwitch.select(roomName)
  }

  componentWillReceiveProps(props) {
    this.props.socketSwitch.select(props.roomName)
  }

  render() {
    const { content, sidebar } = this.props
    return (
      <div className="app-container">
        {sidebar && React.cloneElement(sidebar)}
        {content && React.cloneElement(content)}
      </div>
    )
  }
}

App.propTypes = {
  content: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  now: PropTypes.instanceOf(Date),
  params: PropTypes.object,
  roomName: PropTypes.string,
  rooms: PropTypes.instanceOf(Immutable.Map),
  sidebar: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  socketSwitch: PropTypes.instanceOf(SocketSwitch).isRequired,
}

export default connect(state => state, routeActions)(App)
