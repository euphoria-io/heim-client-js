import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { MOVE_CURSOR } from '../const'

import Editor from './Editor'
import KeyboardHandler from './KeyboardHandler'
import Nick from './Nick'

class ChatEntry extends Component {
  render() {
    const { dispatch, editor, id, nick, pane, roomName } = this.props
    const move = dir => ev => {
      if ((dir === 'left' || dir === 'right') && editor.value !== '') {
        return
      }
      if ((dir === 'up' || dir === 'down') && /\n/.test(editor.value)) {
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
      <KeyboardHandler id={id} className="chat-entry" listenTo={pane} keys={{
        escape: move('top'),
        up: move('up'),
        down: move('down'),
        left: move('left'),
      }}
      >
        <div className="sender">
          <Nick name={nick || 'your name here'} />
        </div>
        <Editor dispatch={dispatch} editorId="main" editorState={editor} roomName={roomName} />
      </KeyboardHandler>
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
