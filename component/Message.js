import Immutable from 'immutable'
import _ from 'lodash'
import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { MOVE_CURSOR } from '../const'

import { nickBgColor, nickBgLightColor } from '../lib/nick'

import Embed from './Embed'
import Nick from './Nick'
import UserText from './UserText'

class Message extends Component {
  render() {
    const { dispatch, embedData, hasChildren, msg, now, roomName, terminal } = this.props

    let messageStyle = {}
    if (hasChildren) {
      messageStyle = {
        ...messageStyle,
        borderTopLeftRadius: '0.3rem',
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: nickBgColor(msg.sender.name).background,
      }
    }

    let content = msg.content
    let _nextEmbedId = 0
    const nextEmbedId = id => {
      const embedId = `${roomName}/${msg.id}/${id}/${_nextEmbedId}`
      _nextEmbedId++
      return embedId
    }

    const getWidth = embedId => embedData.width.get(embedId)

    const embeds = []
    const addEmbed = (key, params) => {
      const embedId = nextEmbedId(key)
      const width = getWidth(embedId)
      embeds.push(<Embed key={embedId} embedId={embedId} width={width} {...params} />)
      return ''
    }

    // imgur embeds
    content = content.replace(
      /(?:https?:\/\/)?(?:www\.|i\.|m\.)?imgur\.com\/(\w+)(\.\w+)?(\S*)/g,
      (match, id, ext, rest) => {
        if (rest) {
          return match
        }
        return addEmbed(id, {
          kind: 'imgur',
          imgurId: id,
          link: '//imgur.com/' + id,
        })
      })
    content = content.replace(
      /(?:https?:\/\/)?(imgs\.xkcd\.com\/comics\/.*\.(?:png|jpg)|i\.ytimg\.com\/.*\.jpg)/g,
      (match, imgUrl) => {
        return addEmbed(imgUrl, {
          kind: 'img',
          url: '//' + imgUrl,
          link: '//' + imgUrl,
        })
      })
    content = _.trim(content)

    const emote = content.startsWith('/me ') && content.length < 240
    const className = emote ? 'message emote' : 'message'
    content = emote ? content.substr(4) : content

    const contentStyle = emote ? nickBgLightColor(msg.sender.name) : null
    const onClick = () => {
      dispatch({
        type: MOVE_CURSOR,
        roomName,
        msgId: msg.id,
      })
    }

    return (
      <div className={className} style={messageStyle} onClick={onClick}>
        <div className="sender">
          <Nick name={msg.sender.name} withThreadLine={hasChildren} />
        </div>
        <div className="content-and-time">
          <UserText
            autolink
            className="content"
            style={contentStyle}
            content={content}
            timestamp={terminal && moment.unix(msg.time)}
            now={now}
          />
          {embeds ? <div className="embeds">{embeds}</div> : null}
        </div>
      </div>
    )
  }
}

Message.mixins = [PureRenderMixin]

Message.propTypes = {
  dispatch: PropTypes.func.isRequired,
  embedData: PropTypes.instanceOf(Immutable.Map()).isRequired,
  hasChildren: PropTypes.bool,
  msg: PropTypes.object,
  now: PropTypes.instanceOf(Date),
  roomName: PropTypes.string.isRequired,
  terminal: PropTypes.bool,
}

export default Message
