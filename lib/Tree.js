import Immutable from 'immutable'

export default class Tree {
  constructor(value = null) {
    Object.assign(this, value || {
      index: Immutable.Map(),
      messages: Immutable.Map(),
      paths: Immutable.Map(),
      pending: Immutable.Map(),
      ready: Immutable.Set(),
    })
    this.changeLog = {
      paths: Immutable.Set(),
      prev: (!!value && !!value.changeLog) ? value.changeLog : null,
    }
  }

  touch(...msgIds) {
    const paths = Immutable.Set.of(...msgIds).filter(msgId => !!msgId).map(msgId => this.paths.get(msgId))
    const newTree = new Tree(this)
    newTree.changeLog = {
      paths,
      prev: this.changeLog,
    }
    return newTree
  }

  addChild(child) {
    const node = child
    if (node.parent === undefined) {
      node.parent = null
    }
    const parentId = node.parent
    let newTree = new Tree(this)

    newTree.messages = this.messages.set(node.id, node)
    newTree.index = this.index.set(parentId, this.index.get(parentId, Immutable.Map()).set(node.id, node))

    if (!!parentId && !this.ready.has(parentId)) {
      const siblings = this.pending.get(parentId, Immutable.List())
      newTree.pending = this.pending.set(parentId, siblings.push(node))
    } else {
      const path = this.paths.get(parentId, '') + '/' + node.id
      newTree.paths = this.paths.set(node.id, path)
      newTree.changeLog.paths = newTree.changeLog.paths.add(path)
      newTree.ready = this.ready.add(node.id)
      if (this.pending.has(node.id)) {
        const siblings = this.pending.get(node.id, Immutable.List())
        newTree.pending = this.pending.delete(node.id)
        newTree = siblings.reduce((r, msg) => r.addChild(msg), newTree)
      }
    }

    return newTree
  }

  get(msgId, def = null) {
    return this.messages.get(msgId, def)
  }

  childrenOf(parentId) {
    return this.index.get(parentId, Immutable.Map()).sortBy(msg => msg.time)
  }

  hasChildren(msgId) {
    return this.index.get(msgId, Immutable.Map()).size > 0
  }

  needMore(after) {
    return this.pending.skipUntil(children => children.skipUntil(msg => msg.id > after).size > 0).size > 0
  }

  precedingParent(parentId) {
    const children = this.childrenOf(parentId)

    // If the parent has children, return last child
    if (!!children.size) {
      return children.last().id
    }

    // Convenience function to find previous sibling or return null
    const prevSibling = msgId => {
      if (msgId === null) {
        return null
      }
      const msg = this.get(msgId)
      const siblings = this.childrenOf(msg.parent).toArray()
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].id === msgId) {
          if (i > 0) {
            return siblings[i - 1].id
          }
          return null
        }
      }
      return null
    }

    // Walk ancestors
    let cur = parentId
    while (!!cur) {
      const p = prevSibling(cur)
      if (p !== null) {
        return p
      }
      cur = this.get(cur).parent
    }

    return null
  }

  nextParent(parentId) {
    // Convenience function to find next sibling or return null
    const nextSibling = msgId => {
      if (msgId === null) {
        return null
      }
      const msg = this.get(msgId)
      if (!msg) {
        return null
      }
      const msgAndAfter = this.childrenOf(msg.parent).skipUntil(m => m.id === msgId)
      if (msgAndAfter.size > 1) {
        return msgAndAfter.rest().first().id
      }
      return null
    }

    // If the parent has a next sibling, return the first child (of the
    // first child, etc.) of the next sibling.
    const nextSiblingId = nextSibling(parentId)
    if (nextSiblingId !== null) {
      let cur = nextSiblingId
      for (;;) {
        const children = this.childrenOf(cur)
        if (!children.size) {
          return cur
        }
        cur = children.first().id
      }
    }

    // Otherwise, move upthread.
    const msg = this.get(parentId)
    return msg ? msg.parent : null
  }
}
