import Immutable from 'immutable'
import test from 'tape'

import Tree from './Tree'

test('Tree constructor', t => {
  const emptyMap = Immutable.Map()
  const emptySet = Immutable.Set()

  t.test('default value', t => {
    const tree = new Tree()
    t.equal(tree.index, emptyMap)
    t.equal(tree.messages, emptyMap)
    t.equal(tree.paths, emptyMap)
    t.equal(tree.pending, emptyMap)
    t.equal(tree.ready, emptySet)
    t.deepEqual(tree.changeLog, {
      paths: emptySet,
      prev: null,
    })
    t.end()
  })

  t.test('derived value', t => {
    const state = {
      index: emptyMap.set('index', 1),
      messages: emptyMap.set('messages', 1),
      paths: emptyMap.set('paths', 1),
      pending: emptyMap.set('pending', 1),
      ready: emptySet.add('ready'),
    }

    const tree = new Tree(state)
    t.equal(tree.index, state.index)
    t.equal(tree.messages, state.messages)
    t.equal(tree.paths, state.paths)
    t.equal(tree.pending, state.pending)
    t.equal(tree.ready, state.ready)
    t.deepEqual(tree.changeLog, {
      paths: emptySet,
      prev: null,
    })

    const tree2 = new Tree(tree)
    t.equal(tree2.index, state.index)
    t.equal(tree2.messages, state.messages)
    t.equal(tree2.paths, state.paths)
    t.equal(tree2.pending, state.pending)
    t.equal(tree2.ready, state.ready)
    t.deepEqual(tree2.changeLog, {
      paths: emptySet,
      prev: tree.changeLog,
    })

    t.end()
  })
})

test('Tree.addChild', t => {
  let tree = new Tree()

  t.test('add first child', t => {
    const msg = {id: 'A'}
    tree = tree.addChild(msg)

    t.deepEqual(tree.index, Immutable.Map().set(null, Immutable.Map().set('A', { parent: null, id: 'A' })))
    t.deepEqual(tree.messages, Immutable.Map().set('A', { parent: null, id: 'A' }))
    t.deepEqual(tree.paths, Immutable.Map().set('A', '/A'))
    t.equal(tree.pending, Immutable.Map())
    t.deepEqual(tree.ready, Immutable.Set().add('A'))
    t.deepEqual(tree.changeLog.paths.toArray(), ['/A'])

    t.end()
  })

  t.test('add first grandchild', t => {
    const msg = {parent: 'A', id: 'AA'}
    tree = tree.addChild(msg)

    t.equal(tree.index.get(null).size, 1)
    t.equal(tree.index.get('A').size, 1)
    t.ok(!tree.index.has('AA'))
    t.equal(tree.paths.get('AA'), '/A/AA')
    t.equal(tree.pending, Immutable.Map())
    t.ok(tree.ready.has('AA'))

    t.end()
  })

  t.test('add pending messages', t => {
    const msg1 = {parent: 'B', id: 'BA'}
    const msg2 = {parent: 'BA', id: 'BAA'}
    tree = tree.addChild(msg1).addChild(msg2)

    t.equal(tree.index.get(null).size, 1)
    t.deepEqual(tree.messages.get('BA'), msg1)
    t.deepEqual(tree.messages.get('BAA'), msg2)
    t.deepEqual(tree.pending.get('B').toArray(), [ msg1 ])
    t.deepEqual(tree.pending.get('BA').toArray(), [ msg2 ])

    t.end()
  })

  t.test('resolve pending messages', t => {
    tree = tree.addChild({ id: 'B' })

    t.equal(tree.pending, Immutable.Map())
    t.equal(tree.paths.get('B'), '/B')
    t.equal(tree.paths.get('BA'), '/B/BA')
    t.equal(tree.paths.get('BAA'), '/B/BA/BAA')

    t.end()
  })
})

test('Tree.touch', t => {
  let tree = new Tree().addChild({ id: 'A' }).addChild({ id: 'B' })
  const prev = tree.changeLog

  tree = tree.touch('A', null, 'B')
  t.equal(tree.changeLog.prev, prev)
  t.deepEqual(tree.changeLog.paths.toArray(), [ '/A', '/B' ])

  t.end()
})

test('Tree.get', t => {
  const tree = new Tree()
  t.equal(tree.get('A'), null)
  t.equal(tree.get('A', 'default'), 'default')
  t.deepEqual(tree.addChild({ id: 'A' }).get('A'), { parent: null, id: 'A' })
  t.end()
})

test('Tree.childrenOf', t => {
  const tree = new Tree()
    .addChild({ id: 'A' })
    .addChild({ parent: 'A', id: 'AA', time: 1 })
    .addChild({ parent: 'A', id: 'AB', time: 0 })
    .addChild({ id: 'B' })
    .addChild({ parent: 'B', id: 'BA' })

  const childrenOf = id => tree.childrenOf(id).map(msg => msg.id).toArray()

  t.deepEqual(childrenOf(null), ['A', 'B'])
  t.deepEqual(childrenOf('A'), ['AB', 'AA'])
  t.deepEqual(childrenOf('B'), ['BA'])
  t.deepEqual(childrenOf('BA'), [])

  t.end()
})

test('Tree.hasChildren', t => {
  const tree = new Tree()
    .addChild({ id: 'A' })
    .addChild({ parent: 'A', id: 'AA' })
    .addChild({ id: 'B' })

  t.ok(tree.hasChildren(null))
  t.ok(tree.hasChildren('A'))
  t.ok(!tree.hasChildren('AA'))
  t.ok(!tree.hasChildren('B'))

  t.end()
})

test('Tree.needMore', t => {
  const tree = new Tree()
    .addChild({ parent: 'A', id: 'AA' })
    .addChild({ parent: 'A', id: 'AB' })
    .addChild({ parent: 'A', id: 'AC' })

  t.ok(tree.needMore('A'))
  t.ok(tree.needMore('AA'))
  t.ok(tree.needMore('AB'))
  t.ok(!tree.needMore('AC'))

  t.end()
})

test('Tree walking', t => {
  const tree = new Tree()
    .addChild({ id: 'A' })
    .addChild({ id: 'B' })
    .addChild({ parent: 'B', id: 'BA' })
    .addChild({ parent: 'BA', id: 'BAA' })
    .addChild({ parent: 'BA', id: 'BAB' })
    .addChild({ parent: 'B', id: 'BB' })
    .addChild({ id: 'C' })

  t.test('Tree.precedingParent', t => {
    const pp = id => tree.precedingParent(id)
    t.equal(pp(null), 'C')
    t.equal(pp('C'), 'B')
    t.equal(pp('B'), 'BB')
    t.equal(pp('BB'), 'BA')
    t.equal(pp('BA'), 'BAB')
    t.equal(pp('BAB'), 'BAA')
    t.equal(pp('BAA'), 'A')
    t.equal(pp('A'), null)
    t.end()
  })

  t.test('Tree.nextParent', t => {
    const np = id => tree.nextParent(id)
    t.equal(np('A'), 'BAA')
    t.equal(np('BAA'), 'BAB')
    t.equal(np('BAB'), 'BA')
    t.equal(np('BA'), 'BB')
    t.equal(np('BB'), 'B')
    t.equal(np('B'), 'C')
    t.equal(np('C'), null)
    t.equal(np(null), null)
    t.end()
  })
})
