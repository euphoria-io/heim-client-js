import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { MOVE_CURSOR } from '../const'

import KeyboardHandler from './KeyboardHandler'
import Nick from './Nick'

class ChatEntry extends Component {
  resize() {
    const { input, measure } = this.refs
    measure.style.width = input.offsetWidth + 'px'
    measure.value = input.value
    input.style.height = measure.scrollHeight + 'px'
  }

  render() {
    const { dispatch, id, nick, pane, roomName } = this.props
    const move = dir => () => {
      console.log('move', dir)
      return dispatch({
        type: MOVE_CURSOR,
        roomName,
        dir,
      })
    }
    const onChange = () => {
      this.resize()
    }
    const onClick = onChange
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
        <textarea ref="input" defaultValue="chat here" onChange={onChange} onClick={onClick} />
        <textarea ref="measure" className="measure" />
      </KeyboardHandler>
    )
  }
}

ChatEntry.mixins = [PureRenderMixin]

ChatEntry.propTypes = {
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  nick: PropTypes.string,
  pane: PropTypes.object.isRequired,
  parentId: PropTypes.string,
  roomName: PropTypes.string,
}

export default ChatEntry
