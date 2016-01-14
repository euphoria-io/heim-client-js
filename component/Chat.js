import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Tree from '../lib/Tree'

import ChatThread from './ChatThread'
import UserList from './UserList'

class Chat extends Component {
  render() {
    const { tree, users } = this.props
    return (
      <div className="chat">
        <ChatThread tree={tree} />
        <UserList users={users} />
      </div>
    )
  }
}

Chat.propTypes = {
  tree: PropTypes.instanceOf(Tree).isRequired,
  users: PropTypes.instanceOf(Immutable.List).isRequired,
}

function select(state) {
  return state.chat
}

export default connect(select)(Chat)
