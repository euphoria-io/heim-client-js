import _ from 'lodash'
import React, { PropTypes } from 'react'

export default function Page({ title, html, scriptHash, cssFiles }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
        />
        <title>{title}</title>
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700,600,800"
          rel="stylesheet"
          type="text/css"
        />
        {_.map(cssFiles, cssName =>
          <link rel="stylesheet" type="text/css" id="css" href={'/' + cssName} />
        )}
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={html} />
        <script src={'/main.' + scriptHash + '.js'} />
      </body>
    </html>
  )
}

Page.propTypes = {
  title: PropTypes.string.isRequired,
  html: PropTypes.object.isRequired,
  scriptHash: PropTypes.string.isRequired,
  cssFiles: PropTypes.arrayOf(PropTypes.string).isRequired,
}
