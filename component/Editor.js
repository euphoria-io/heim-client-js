import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { EDIT_TEXT } from '../const'

const initialState = {
  selectionDirection: 'forward',
  selectionStart: 0,
  selectionEnd: 0,
  value: '',
}

class Editor extends Component {
  componentDidMount() {
    const { editorState } = this.props
    const el = ReactDOM.findDOMNode(this.refs.input)
    this.resize()
    el.focus()
    el.setSelectionRange(editorState.selectionStart, editorState.selectionEnd, editorState.selectionDirection)
    el.addEventListener('keyup', ev => this._dispatch(ev.target))
    el.addEventListener('select', ev => this._dispatch(ev.target))
  }

  resize() {
    const { input, measure } = this.refs
    measure.style.width = input.offsetWidth + 'px'
    measure.value = input.value
    input.style.height = measure.scrollHeight + 'px'
  }

  reset() {
    const el = ReactDOM.findDOMNode(this.refs.input)
    el.value = ''
  }

  dispatch() {
    return this._dispatch(ReactDOM.findDOMNode(this.refs.input))
  }

  _dispatch(el) {
    const { dispatch, editorState, roomName } = this.props
    dispatch({
      type: EDIT_TEXT,
      roomName,
      editor: {
        parentId: editorState.parentId,
        selectionDirection: el.selectionDirection,
        selectionEnd: el.selectionEnd,
        selectionStart: el.selectionStart,
        value: el.value,
      },
    })
  }

  render() {
    const { editorId } = this.props
    const editorState = this.props.editorState || initialState
    const onChange = ev => {
      this.resize()
      this._dispatch(ev.target)
    }
    const onClick = onChange

    return (
      <div id={'editor-' + editorId} className="editor">
        <textarea
          ref="input"
          defaultValue={editorState.value}
          onChange={onChange}
          onClick={onClick}
        />
        <textarea ref="measure" className="measure" />
      </div>
    )
  }
}

Editor.mixins = [PureRenderMixin]

Editor.propTypes = {
  dispatch: PropTypes.func.isRequired,
  editorId: PropTypes.string.isRequired,
  editorState: PropTypes.shape(initialState),
  roomName: PropTypes.string.isRequired,
}

export default Editor
