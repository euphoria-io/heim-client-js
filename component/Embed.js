import queryString from 'querystring'
import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

class Embed extends Component {
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

    return (
      <a className="embed" href={link} target="_blank">
        <iframe
          src={embedUrl}
          style={{ width }}
        />
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
