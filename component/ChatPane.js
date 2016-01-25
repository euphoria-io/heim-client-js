import React, { PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { SEND_PACKET } from '../const'

import Tree from '../lib/Tree'

import ChatEntry from './ChatEntry'
import ChatThread from './ChatThread'
import Pane from './Pane'
import ScrollFollower from './ScrollFollower'

class ChatPane extends Pane {
  render() {
    const { dispatch, nick, now, oldestMsgId, roomName, tree } = this.props
    const chatEntry = (
      <ChatEntry id="chat-entry" dispatch={dispatch} nick={nick} pane={this} roomname={roomName} />
    )
    const fetchMore = () => {
      if (oldestMsgId) {
        dispatch({
          type: SEND_PACKET,
          roomName,
          packet: {
            type: 'log',
            data: {
              before: oldestMsgId,
              n: 100,
            },
          },
        })
      }
    }
    return (
      <ScrollFollower className="children top" cursor="chat-entry" fetchMore={fetchMore}>
        <ChatThread entry={chatEntry} now={now} tree={tree} />
      </ScrollFollower>
    )
  }
}

ChatPane.mixins = [PureRenderMixin]

ChatPane.propTypes = {
  dispatch: PropTypes.func.isRequired,
  nick: PropTypes.string,
  now: PropTypes.instanceOf(Date),
  oldestMsgId: PropTypes.string,
  roomName: PropTypes.string.isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

export default ChatPane
