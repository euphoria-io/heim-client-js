import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import Backlog from './Backlog'

class ScrollFollower extends Component {
  constructor() {
    super()
    this.follow = true
    this.lastParentHeight = 0
    this.lastScrollTop = 0
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      this._handler = _.throttle(() => {
        if (this.follow) {
          const container = this._container()
          container.scrollTop = this._threshold(container)
          this.lastScrollTop = container.scrollTop
          this.lastParentHeight = container.parentNode.clientHeight
        }
      })
      window.addEventListener('resize', this._handler)
    }
  }

  componentDidUpdate() {
    if (this.follow) {
      const container = this._container()
      this.lastScrollTop = container.scrollTop = this._threshold(container)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._handler)
  }

  onScroll() {
    const container = this._container()
    const threshold = this._threshold(container)
    if (this.follow) {
      if (this.lastScrollTop === container.scrollTop) {
        return
      }
      if (this.lastParentHeight === container.parentNode.clientHeight) {
        this.follow = false
        console.log('scroll unlocked') // eslint-disable-line no-console
      }
    } else {
      this.follow = container.scrollTop >= threshold
      if (this.follow) {
        console.log('scroll locked') // eslint-disable-line no-console
      }
    }
    this.lastScrollTop = container.scrollTop
    this.lastParentHeight = container.parentNode.clientHeight

    if (!this.follow && this.lastScrollTop < 10) {
      if (this.props.backlog) {
        this.props.backlog.fetchMore()
      }
    }
  }

  _container() {
    return ReactDOM.findDOMNode(this)
  }

  _threshold(container) {
    return container.scrollHeight - container.clientHeight
  }

  render() {
    const { className, children } = this.props
    const onScroll = () => this.onScroll()
    return <div className={className} onScroll={onScroll}>{children}</div>
  }
}

ScrollFollower.propTypes = {
  backlog: PropTypes.instanceOf(Backlog),
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  className: PropTypes.string,
}

function select(state) {
  return state
}

export default connect(select)(ScrollFollower)
