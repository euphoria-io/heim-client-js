import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Socket from '../lib/Socket'
import Tree from '../lib/Tree'

import ChatThread from './ChatThread'

class Chat extends Component {
  render() {
    return <ChatThread {...this.props} />
  }
}

Chat.propTypes = {
  tree: PropTypes.instanceOf(Tree).isRequired,
}

function select(state) {
  return state
}

export default connect(select)(Chat)
