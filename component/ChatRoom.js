import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Socket from '../lib/Socket'

import Chat from './Chat'
import Connection from './Connection'
import UserList from './UserList'

class ChatRoom extends Component {
  render() {
    return (
      <div className="chat-room">
        <Connection {...this.props} />
        <div className="chat-room-content">
          <Chat {...this.props} />
          <UserList {...this.props} />
        </div>
      </div>
    )
  }
}

ChatRoom.propTypes = {
  ws: PropTypes.instanceOf(Socket).isRequired,
}

function select(state) {
  return state.chat
}

export default connect(select)(ChatRoom)
