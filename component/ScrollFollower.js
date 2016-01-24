import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

class ScrollFollower extends Component {
  constructor() {
    super()
    this.follow = true
    this.lastHeight = 0
    this.lastScrollTop = 0
    this.tempOffset = null
    this.counter = 0
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      this._handler = _.throttle(() => {
        if (this.follow) {
          const anchor = document.getElementById(this.props.cursor)
          if (!anchor) {
            return
          }
          const container = ReactDOM.findDOMNode(this)
          this.scrollAnchorIntoView(container, anchor)
        }
      })
      window.addEventListener('resize', this._handler)
    }
  }

  componentDidUpdate() {
    if (this.tempOffset !== null && this.counter) {
      const container = ReactDOM.findDOMNode(this)
      const offset = this.tempOffset
      this.tempOffset = null
      container.scrollTop = container.scrollHeight - offset
    }

    this.counter++
    if (this.follow) {
      const anchor = document.getElementById(this.props.cursor)
      if (!anchor) {
        return
      }
      const container = ReactDOM.findDOMNode(this)
      setTimeout(() => this.scrollAnchorIntoView(container, anchor), 0)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._handler)
  }

  onScroll() {
    const container = ReactDOM.findDOMNode(this)
    const anchor = document.getElementById(this.props.cursor)
    if (!anchor) {
      return
    }
    if (this.follow) {
      if (this.lastScrollTop === container.scrollTop) {
        return
      }
      if (this.lastHeight === container.clientHeight) {
        this.follow = false
        console.log('scroll unlocked') // eslint-disable-line no-console
      } else {
        this.scrollAnchorIntoView(container, anchor)
      }
    } else {
      if (this.anchorInView(container, anchor)) {
        console.log('scroll locked') // eslint-disable-line no-console
        this.follow = true
      }
    }

    const { fetchMore } = this.props
    if (fetchMore && this.tempOffset === null && container.scrollTop <= 0) {
      this.tempOffset = container.scrollHeight
      this.counter = 0
      fetchMore()
    }
  }

  anchorInView(container, anchor) {
    const { clientHeight, scrollTop } = container
    const anchorScrollTopPos = anchor.offsetTop - container.offsetTop
    const anchorScrollBottomPos = anchorScrollTopPos + anchor.offsetHeight
    return anchorScrollTopPos >= scrollTop && anchorScrollBottomPos <= scrollTop + clientHeight
  }

  scrollAnchorIntoView(container, anchor) {
    const { clientHeight, scrollTop } = container
    const anchorScrollTopPos = anchor.offsetTop - container.offsetTop
    const anchorScrollBottomPos = anchorScrollTopPos + anchor.offsetHeight
    let newScrollTop = container.scrollTop
    if (anchorScrollTopPos < scrollTop) {
      newScrollTop = anchorScrollTopPos
    } else if (anchorScrollBottomPos > scrollTop + clientHeight) {
      newScrollTop = anchorScrollBottomPos - clientHeight
    }
    if (newScrollTop !== container.scrollTop) {
      this.lastScrollTop = newScrollTop
      this.lastHeight = container.clientHeight
      container.scrollTop = newScrollTop // eslint-disable-line no-param-reassign
    }
  }

  render() {
    const { className, children } = this.props
    const onScroll = () => this.onScroll()
    return <div className={className} onScroll={onScroll}>{children}</div>
  }
}

ScrollFollower.propTypes = {
  cursor: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  className: PropTypes.string,
  fetchMore: PropTypes.func,
}

export default ScrollFollower
