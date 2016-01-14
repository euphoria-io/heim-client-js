import React from 'react'
import ReactDOMServer from 'react-dom/server'

import Page from '../component/Page'

function renderStaticPage(store, view, locals, callback) {
  let find = require('core-js/library/fn/array/find')
  const files = locals.webpackStats.compilation.namedChunks.main.files
  const cssName = find(files, name => /\.css$/.test(name))
  const appHTML = { __html: ReactDOMServer.renderToString(view) }
  const page = (
    <Page
      title="Euphoria"
      html={appHTML}
      scriptHash={locals.webpackStats.compilation.hash}
      cssName={cssName}
    />
  )
  const pageHTML = ReactDOMServer.renderToStaticMarkup(page)
  callback(null, '<!DOCTYPE html>' + pageHTML)
}

export default renderStaticPage
