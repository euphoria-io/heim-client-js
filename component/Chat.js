import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import ScrollFollower from '../lib/ScrollFollower'
import Tree from '../lib/Tree'

import ChatThread from './ChatThread'

class Chat extends Component {
  render() {
    const { now, roomName, tree } = this.props
    return (
      <ScrollFollower className="children top" roomName={roomName}>
        <ChatThread now={now} tree={tree} />
      </ScrollFollower>
    )
  }
}

Chat.mixins = [PureRenderMixin]

Chat.propTypes = {
  now: PropTypes.instanceOf(Date),
  roomName: PropTypes.string.isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

export default Chat
