import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class Connection extends Component {
  render() {
    const { socketState } = this.props
    return (
      <div className="connection">
        <span className="connection-state">{socketState}</span>
      </div>
    )
  }
}

Connection.propTypes = {
  socketState: PropTypes.string.isRequired,
}

function select(state) {
  const { chatSwitch } = state
  const chat = chatSwitch.chats.get(chatSwitch.currentRoom)
  if (!chat) {
    return {socketState: 'disconnected'}
  }
  return chat
}

export default connect(select)(Connection)
