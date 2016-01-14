import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Tree from '../lib/Tree'

import ChatThread from './ChatThread'

class Chat extends Component {
  render() {
    const { tree } = this.props
    return (
      <div className="chat">
        <ChatThread tree={tree} />
      </div>
    )
  }
}

Chat.propTypes = {
  tree: PropTypes.instanceOf(Tree).isRequired,
}

function select(state) {
  return state.chat
}

export default connect(select)(Chat)
