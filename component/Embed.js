import queryString from 'querystring'
import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

class Embed extends Component {
  _sendMessage(data) {
    console.log('posting embed message', this.refs)
    this.refs.iframe.contentWindow.postMessage(data, process.env.EMBED_ORIGIN)
  }

  render() {
    const embedOrigin = process.env.EMBED_ORIGIN

    const { embedId, imgurId, kind, link, url, width } = this.props
    const params = {
      id: embedId,
      imgur_id: imgurId,
      kind,
      link,
      url,
    }
    const embedUrl = embedOrigin + '/?' + queryString.stringify(params)

    const onMouseEnter = () => {
      this._sendMessage({ type: 'unfreeze', id: this.props.embedId })
    }

    const onMouseLeave = () => {
      this._sendMessage({ type: 'freeze', id: this.props.embedId })
    }

    return (
      <a
        className="embed"
        href={link}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        target="_blank"
        style={{ flexBasis: width }}
      >
        <iframe ref="iframe" src={embedUrl} />
      </a>
    )
  }
}

Embed.mixins = [PureRenderMixin]

Embed.propTypes = {
  embedId: PropTypes.string.isRequired,
  imgurId: PropTypes.string,
  kind: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  url: PropTypes.string,
  width: PropTypes.number,
}

export default Embed
