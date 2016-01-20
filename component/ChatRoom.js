import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import SocketSwitch from '../lib/SocketSwitch'
import Tree from '../lib/Tree'

import Chat from './Chat'
import Connection from './Connection'
import UserList from './UserList'

class ChatRoom extends Component {
  render() {
    const { roomName, socketState, socketSwitch } = this.props
    if (!roomName) {
      return null
    }
    return (
      <div className="chat-room">
        <Connection socketState={socketState} />
        <div className="chat-room-content">
          <Chat roomName={roomName} socketSwitch={socketSwitch} />
          <UserList roomName={roomName} />
        </div>
      </div>
    )
  }
}

ChatRoom.propTypes = {
  roomName: PropTypes.string,
  socketState: PropTypes.string.isRequired,
  socketSwitch: PropTypes.instanceOf(SocketSwitch).isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

function select(state, props) {
  const { roomName } = props
  return state.chatSwitch.chats.get(roomName)
}

export default connect(select)(ChatRoom)
