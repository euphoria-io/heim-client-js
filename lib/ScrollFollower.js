import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

class ScrollFollower extends Component {

  constructor() {
    super()
    this.follow = true
    this.lastParentHeight = 0
    this.lastScrollTop = 0
  }

  render() {
    const { className, children } = this.props
    return <div className={className} onScroll={() => this.onScroll()}>{children}</div>
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      this._handler = _.throttle(() => {
        if (this.follow) {
          let container = this._container()
          container.scrollTop = this._threshold(container)
          this.lastScrollTop = container.scrollTop
          this.lastParentHeight = container.parentNode.clientHeight
        }
      })
      window.addEventListener('resize', this._handler)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._handler)
  }

  componentDidUpdate() {
    if (this.follow) {
      let container = this._container()
      container.scrollTop = this._threshold(container)
    }
  }

  _container() {
    return ReactDOM.findDOMNode(this)
  }

  _threshold(container) {
    return container.scrollHeight - container.clientHeight
  }

  onScroll() {
    let container = this._container()
    const threshold = this._threshold(container)
    if (this.follow) {
      if (this.lastScrollTop == container.scrollTop) {
        return
      }
      if (this.lastParentHeight == container.parentNode.clientHeight) {
        this.follow = false
      }
    } else {
      this.follow = container.scrollTop >= threshold
    }
    this.lastScrollTop = container.scrollTop
    this.lastParentHeight = container.parentNode.clientHeight
  }
}

ScrollFollower.propTypes = {
  className: PropTypes.string,
}

function select(state) {
  return state
}

export default connect(select)(ScrollFollower)
