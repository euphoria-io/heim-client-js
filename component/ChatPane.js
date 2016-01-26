import React, { PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { SEND_PACKET } from '../const'

import Tree from '../lib/Tree'

import ChatThread from './ChatThread'
import Pane from './Pane'
import ScrollFollower from './ScrollFollower'

class ChatPane extends Pane {
  render() {
    const { cursorParent, dispatch, nick, now, oldestMsgId, roomName, tree } = this.props
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
        <ChatThread
          cursorParent={cursorParent}
          dispatch={dispatch}
          nick={nick}
          now={now}
          pane={this}
          roomName={roomName}
          tree={tree}
        />
      </ScrollFollower>
    )
  }
}

ChatPane.mixins = [PureRenderMixin]

ChatPane.propTypes = {
  cursorParent: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  nick: PropTypes.string,
  now: PropTypes.instanceOf(Date),
  oldestMsgId: PropTypes.string,
  roomName: PropTypes.string.isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

export default ChatPane
