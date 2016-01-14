import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Socket from '../lib/Socket'

import Chat from './Chat'
import Connection from './Connection'

class App extends Component {
  render() {
    const { ws } = this.props
    return (
      <div>
        <Connection ws={ws} />
        <Chat />
      </div>
    )
  }
}

App.propTypes = {
  ws: PropTypes.instanceOf(Socket).isRequired,
}

function select(state) {
  return state
}

export default connect(select)(App)
