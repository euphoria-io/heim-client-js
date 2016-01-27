import test from 'tape'

import { TICK } from '../const'

import now from './now'

test('now', t => {
  let state = now(undefined, { type: 'ignore' })
  t.equal(state, null)

  state = now(state, { type: TICK, now: 'now' })
  t.equal(state, 'now')

  state = now(state, { type: 'ignore' })
  t.equal(state, 'now')

  t.end()
})
