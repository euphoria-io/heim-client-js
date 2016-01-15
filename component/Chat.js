import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Socket from '../lib/Socket'
import Tree from '../lib/Tree'

import Connection from './Connection'
import ChatThread from './ChatThread'
import UserList from './UserList'

class Chat extends Component {
  render() {
    const { tree, users, ws } = this.props
    return (
      <div>
        <Connection ws={ws} />
        <div className="chat">
          <ChatThread tree={tree} />
          <UserList users={users} />
        </div>
      </div>
    )
  }
}

Chat.propTypes = {
  tree: PropTypes.instanceOf(Tree).isRequired,
  users: PropTypes.instanceOf(Immutable.Map).isRequired,
  ws: PropTypes.instanceOf(Socket).isRequired,
}

function select(state) {
  return state.chat
}

export default connect(select)(Chat)
