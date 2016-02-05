import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { MOVE_CURSOR, SEND_PACKET } from '../const'

import Editor from './Editor'
import KeyboardHandler from './KeyboardHandler'
import Nick from './Nick'

class ChatEntry extends Component {
  render() {
    const { dispatch, editor, id, nick, pane, parentId, roomName } = this.props
    const send = ev => {
      const value = ev.target.value
      ev.preventDefault()
      ev.stopPropagation()
      if (!value.length) {
        return
      }
      this.refs.editor.reset()
      dispatch({
        type: SEND_PACKET,
        roomName,
        packet: {
          type: 'send',
          data: {
            parent: parentId,
            content: value,
          },
        },
      })
    }

    const move = dir => ev => {
      const current = this.refs.editor.props.editorState
      if ((dir === 'left' || dir === 'right') && current.value !== '') {
        return
      }
      if ((dir === 'up' || dir === 'down') && /\n/.test(current.value)) {
        return
      }

      ev.preventDefault()
      ev.stopPropagation()

      dispatch({
        type: MOVE_CURSOR,
        roomName,
        dir,
      })
    }

    return (
      <div key={`chat-entry-${roomName}`} className="chat-entry">
        <KeyboardHandler id={id} className="chat-entry-row" listenTo={pane} keys={{
          escape: move('top'),
          up: move('up'),
          down: move('down'),
          left: move('left'),
          right: move('right'),
          enter: send,
        }}
        >
          <div className="sender">
            <Nick name={nick || 'your name here'} />
          </div>
          <Editor ref="editor" dispatch={dispatch} editorId="main" editorState={editor} roomName={roomName} />
        </KeyboardHandler>
      </div>
    )
  }
}

ChatEntry.mixins = [PureRenderMixin]

ChatEntry.propTypes = {
  dispatch: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  nick: PropTypes.string,
  pane: PropTypes.object.isRequired,
  parentId: PropTypes.string,
  roomName: PropTypes.string,
}

export default ChatEntry
