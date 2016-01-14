import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class SocketLog extends Component {
  render() {
    const { dispatch, log } = this.props
    return (
      <div className="socket-log">
        {log.map(entry =>
          <div className="socket-log-entry">{entry.type}</div>
        )}
      </div>
    )
  }
}

SocketLog.propTypes = {
  log: PropTypes.instanceOf(Immutable.List).isRequired
}

function select(state) {
  return state.socketLog
}

export default connect(select)(SocketLog)
