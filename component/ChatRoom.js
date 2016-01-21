import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import SocketSwitch from '../lib/SocketSwitch'
import Tree from '../lib/Tree'

import Chat from './Chat'
import Connection from './Connection'
import UserList from './UserList'

class ChatRoom extends Component {
  render() {
    const { now, roomName, socketState, socketSwitch, tree } = this.props
    if (!roomName) {
      return null
    }
    return (
      <div className="chat-room">
        <Connection socketState={socketState} />
        <div className="chat-room-content">
          <Chat now={now} roomName={roomName} socketSwitch={socketSwitch} tree={tree} />
          <UserList roomName={roomName} />
        </div>
      </div>
    )
  }
}

ChatRoom.propTypes = {
  now: PropTypes.instanceOf(Date),
  roomName: PropTypes.string,
  socketState: PropTypes.string.isRequired,
  socketSwitch: PropTypes.instanceOf(SocketSwitch).isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

function select(state, props) {
  const { roomName } = props
  const newState = state.chatSwitch.chats.get(roomName)
  return {
    ...newState,
    now: state.now.now,
  }
}

export default connect(select)(ChatRoom)
