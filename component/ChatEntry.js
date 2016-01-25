import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import Nick from './Nick'

class ChatEntry extends Component {
  resize() {
    const { input, measure } = this.refs
    measure.style.width = input.offsetWidth + 'px'
    measure.value = input.value
    input.style.height = measure.scrollHeight + 'px'
  }

  render() {
    const { id, nick } = this.props
    const onChange = () => {
      this.resize()
    }
    const onClick = onChange
    return (
      <div id={id} className="chat-entry">
        <div className="sender">
          <Nick name={nick || 'your name here'} />
        </div>
        <textarea ref="input" defaultValue="chat here" onChange={onChange} onClick={onClick} />
        <textarea ref="measure" className="measure" />
      </div>
    )
  }
}

ChatEntry.mixins = [PureRenderMixin]

ChatEntry.propTypes = {
  id: PropTypes.string.isRequired,
  nick: PropTypes.string,
  parentId: PropTypes.string,
}

export default ChatEntry
