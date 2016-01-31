import Immutable from 'immutable'
import React, { PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { SEND_PACKET } from '../const'

import ChatThread from './ChatThread'
import Pane from './Pane'
import ScrollFollower from './ScrollFollower'

class ChatPane extends Pane {
  render() {
    const { chat, dispatch, embedData, now, roomName } = this.props
    const fetchMore = () => {
      if (chat.oldestMsgId) {
        dispatch({
          type: SEND_PACKET,
          roomName,
          packet: {
            type: 'log',
            data: {
              before: chat.oldestMsgId,
              n: 100,
            },
          },
        })
      }
    }
    return (
      <ScrollFollower className="children top" cursor="chat-entry" fetchMore={fetchMore}>
        <ChatThread chat={chat} dispatch={dispatch} embedData={embedData} now={now} pane={this} roomName={roomName} />
      </ScrollFollower>
    )
  }
}

ChatPane.mixins = [PureRenderMixin]

ChatPane.propTypes = {
  chat: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  embedData: PropTypes.instanceOf(Immutable.Map()).isRequired,
  now: PropTypes.instanceOf(Date),
  roomName: PropTypes.string.isRequired,
}

export default ChatPane
