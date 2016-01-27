import test from 'tape'

import { hue, normalize, stripSpaces } from './hueHash'

test('stripSpaces', t => {
  t.equal(stripSpaces(''), '')
  t.equal(stripSpaces(' '), '')
  t.equal(stripSpaces(' xyz'), 'xyz')
  t.equal(stripSpaces('xyz '), 'xyz')
  t.equal(stripSpaces('   x y  z   '), 'xyz')
  t.end()
})

test('normalize', t => {
  t.equal(normalize(' _ - N'), '_-n')
  t.end()
})

test('hue', t => {
  t.equal(hue('greenie'), 148)
  t.equal(hue('greenie'), 148) // repeat to hit cache
  t.equal(hue(''), 84)
  t.equal(hue(' \t\n'), 116)
  t.end()
})
