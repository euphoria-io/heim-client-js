import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import Backlog from '../lib/Backlog'
import ScrollFollower from '../lib/ScrollFollower'
import SocketSwitch from '../lib/SocketSwitch'
import Tree from '../lib/Tree'

import ChatThread from './ChatThread'

class Chat extends Component {
  render() {
    const { now, roomName, socketSwitch, tree } = this.props
    const backlog = new Backlog(socketSwitch, roomName)
    return (
      <ScrollFollower className="children top" backlog={backlog}>
        <ChatThread now={now} tree={tree} />
      </ScrollFollower>
    )
  }
}

Chat.mixins = [PureRenderMixin]

Chat.propTypes = {
  now: PropTypes.instanceOf(Date),
  roomName: PropTypes.string.isRequired,
  socketSwitch: PropTypes.instanceOf(SocketSwitch).isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

export default Chat
