import React, { Component, PropTypes } from 'react'

class Connection extends Component {
  render() {
    const { roomName } = this.props
    return (
      <div className="connection">
        <div className="spacer" />
        <div className="room">
          <span className="room-name">&amp;{roomName}</span>
          Room description goes here.
        </div>
        <div className="spacer" />
      </div>
    )
  }
}

Connection.propTypes = {
  roomName: PropTypes.string.isRequired,
  socketState: PropTypes.string.isRequired,
}

export default Connection
