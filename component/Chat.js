import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import ScrollFollower from '../lib/ScrollFollower'
import Tree from '../lib/Tree'

import ChatEntry from './ChatEntry'
import ChatThread from './ChatThread'

class Chat extends Component {
  render() {
    const { nick, now, roomName, tree } = this.props
    const chatEntry = <ChatEntry nick={nick} />
    this.scrollAnchor = chatEntry
    return (
      <ScrollFollower className="children top" roomName={roomName}>
        <ChatThread entry={chatEntry} now={now} tree={tree} />
      </ScrollFollower>
    )
  }
}

Chat.mixins = [PureRenderMixin]

Chat.propTypes = {
  nick: PropTypes.string,
  now: PropTypes.instanceOf(Date),
  roomName: PropTypes.string.isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

export default Chat
