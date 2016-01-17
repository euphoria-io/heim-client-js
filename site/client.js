import ReactDOM from 'react-dom'

export default function client(store, view) {
  ReactDOM.render(view, document.getElementById('app'))
}
