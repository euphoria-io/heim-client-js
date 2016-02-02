import queryString from 'querystring'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { routeActions } from 'redux-simple-router'

import { EMBED_MESSAGE_RECEIVED } from '../const'

const allowedImageDomains = {
  'imgs.xkcd.com': true,
  'i.ytimg.com': true,
}

class EmbedPage extends Component {
  constructor() {
    super()
    this.widthSent = false
    this._freezeHandler = null
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      console.log('mounting embed page:', this.props)
      const { dispatch } = this.props
      this._onMessage = ev => this.onMessage(ev, dispatch)
      window.addEventListener('message', this._onMessage, false)
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this._onMessage, false)
      this._onMessage = null
    }
  }

  onMessage(ev, dispatch) {
    // TODO: check origin
    const { data } = ev
    dispatch({
      type: EMBED_MESSAGE_RECEIVED,
      data,
    })
  }

  sendImageSize(id) {
    if (this.widthSent) {
      return
    }
    this.widthSent = true

    const img = ReactDOM.findDOMNode(this.refs.img)
    const displayHeight = document.body.offsetHeight
    console.log('display height:', displayHeight)
    let displayWidth
    const ratio = img.naturalWidth / img.naturalHeight

    if (ratio < 9 / 16) {
      displayWidth = 9 / 16 * displayHeight
      img.style.width = displayWidth + 'px'
      img.style.height = 'auto'
    } else {
      displayWidth = img.naturalWidth * (displayHeight / img.naturalHeight)
    }

    window.top.postMessage({
      id,
      type: 'size',
      data: {
        width: displayWidth,
      },
    }, process.env.HEIM_ORIGIN)
  }

  checkImage() {
    const img = ReactDOM.findDOMNode(this.refs.img)
    if (img && img.naturalWidth) {
      this.sendImageSize()
    } else if (!this.widthSent) {
      setTimeout(this.checkImage, 100)
    }
  }

  renderPreviewAndFullSize() {
    const { embedData, location } = this.props
    const { query } = location
    const { id, kind } = query
    const isFrozen = embedData.frozen.get(id, true)
    console.log('isFrozen:', isFrozen)
    switch (kind) {
      case 'imgur':
        return this.renderImgur(isFrozen)
      case 'image':
        return this.renderImage(isFrozen)
      case 'youtube':
        return this.renderYouTube(isFrozen)
      default:
        return null
    }
  }

  renderImgur(isFrozen) {
    const { id, imgur_id } = this.props.location.query

    const onLoad = () => this.sendImageSize(id)

    console.log('fullsize img with className', (isFrozen ? 'cover frozen' : 'cover'))
    return [
      <img ref="img" src={`//i.imgur.com/${imgur_id}l.jpg`} onLoad={onLoad} />, // eslint-disable-line camelcase
      <img
        ref="fullsize"
        className={ isFrozen ? 'cover frozen' : 'cover' }
        src={`//i.imgur.com/${imgur_id}.jpg`} // eslint-disable-line camelcase
      />,
    ]
  }

  renderImage(isFrozen) {
    const { id, url } = this.props.location.query
    const domain = url.match(/\/\/([^/]+)\//)
    if (!domain || !allowedImageDomains.hasOwnProperty(domain[1])) {
      return []
    }

    const onLoad = () => {
      this.sendImageSize(id)

      // inspired by http://stackoverflow.com/a/4276742
      const canvasEl = ReactDOM.findDOMNode(this.refs.fullsize)
      const img = ReactDOM.findDOMNode(this.refs.img)
      const w = canvasEl.width = img.naturalWidth
      const h = canvasEl.height = img.naturalHeight
      canvasEl.getContext('2d').drawImage(img, 0, 0, w, h)
      canvasEl.style.width = img.style.width
      canvasEl.style.height = img.style.height
    }

    return [
      <img ref="img" src={url} onLoad={onLoad} />,
      <canvas ref="fullsize" className={ isFrozen ? 'cover frozen' : 'cover' } />,
    ]
  }

  renderYouTube() {
    const { autoplay, start, youtube_id } = this.props.location.query
    const params = queryString.stringify({ autoplay, start })
    return [
      <embed src={`//www.youtube.com/embed/${youtube_id}?${params}`} />, // eslint-disable-line camelcase
    ]
  }

  render() {
    const parts = this.renderPreviewAndFullSize()
    if (!parts) {
      return null
    }
    if (parts.length === 1) {
      return parts[0]
    }
    if (parts.length > 2) {
      this._freezeHandler = parts[2]
    }
    return (
      <div className="embed-page">
        {parts[0]}
        {parts[1]}
      </div>
    )
  }
}

EmbedPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  embedData: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
}

function select(state) {
  return { embedData: state.embed }
}

export default connect(select, dispatch => ({ dispatch, ...routeActions }))(EmbedPage)
