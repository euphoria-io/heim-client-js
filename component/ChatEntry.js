import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import Nick from './Nick'

class ChatEntry extends Component {
  render() {
    const { nick } = this.props
    return (
      <div className="chat-entry">
        <div className="sender">
          <Nick name={nick || 'your name here'} />
        </div>
        <textarea>chat here</textarea>
      </div>
    )
  }
}

ChatEntry.mixins = [PureRenderMixin]

ChatEntry.propTypes = {
  nick: PropTypes.string,
  parentId: PropTypes.string,
}

export default ChatEntry
