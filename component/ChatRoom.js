import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import SocketSwitch from '../lib/SocketSwitch'
import Tree from '../lib/Tree'

import Chat from './Chat'
import Connection from './Connection'
import UserList from './UserList'

class ChatRoom extends Component {
  render() {
    const { roomName, socketState } = this.props
    if (!roomName) {
      return null
    }
    return (
      <div className="chat-room">
        <Connection socketState={socketState} />
        <div className="chat-room-content">
          <Chat roomName={roomName} />
          <UserList roomName={roomName} />
        </div>
      </div>
    )
  }
}

ChatRoom.propTypes = {
  roomName: PropTypes.string,
  socketSwitch: PropTypes.instanceOf(SocketSwitch).isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

function select(state, props) {
  const { chatSwitch } = state
  const { roomName } = props
  return state.chatSwitch.chats.get(roomName)
}

export default connect(select)(ChatRoom)
