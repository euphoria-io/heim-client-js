import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Socket from '../lib/Socket'

class Connection extends Component {
  render() {
    const { dispatch, connection, ws } = this.props
    if (connection.socketState === 'disconnected') {
      ws.connect()
    }
    return (
      <div className="connection">
        <span className="connection-state">{connection.socketState}</span>
      </div>
    )
  }
}

Connection.propTypes = {
  connection: PropTypes.shape({
    socketState: PropTypes.string.isRequired,
  }).isRequired,
  ws: PropTypes.instanceOf(Socket).isRequired,
}

function select(state) {
  return state.session
}

export default connect(select)(Connection)
