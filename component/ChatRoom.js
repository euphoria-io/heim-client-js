import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Socket from '../lib/Socket'

import Chat from './Chat'

class ChatRoom extends Component {
  render() {
    return <Chat ws={this.props.ws} />
  }
}

ChatRoom.propTypes = {
  ws: PropTypes.instanceOf(Socket).isRequired,
}

function select(state) {
  return state
}

export default connect(select)(ChatRoom)
