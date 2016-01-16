import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import SocketSwitch from '../lib/SocketSwitch'

import Chat from './Chat'
import Connection from './Connection'
import UserList from './UserList'

class ChatRoom extends Component {
  render() {
    const { chats, currentRoom } = this.props
    const chat = chats.get(currentRoom)
    return (
      <div className="chat-room">
        <Connection />
        <div className="chat-room-content">
          <Chat />
          <UserList />
        </div>
      </div>
    )
  }

  componentDidMount() {
    console.log('update chat room')
    this.props.socketSwitch.select(this.props.currentRoom)
  }

  componentDidUpdate() {
    console.log('update chat room')
    this.props.socketSwitch.select(this.props.currentRoom)
  }
}

ChatRoom.propTypes = {
  currentRoom: PropTypes.string,
  socketSwitch: PropTypes.instanceOf(SocketSwitch).isRequired,
}

function select(state) {
  return state.chatSwitch
}

export default connect(select)(ChatRoom)
