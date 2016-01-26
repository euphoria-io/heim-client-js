import Immutable from 'immutable'

export default class Tree {
  constructor(value = null) {
    if (!value) {
      this.changeLog = {
        paths: Immutable.Set(),
        prev: null,
      }
      this.index = Immutable.Map()
      this.messages = Immutable.Map()
      this.paths = Immutable.Map()
      this.pending = Immutable.Map()
      this.ready = Immutable.Set()
    } else {
      this.changeLog = {
        paths: Immutable.Set(),
        prev: value.changeLog,
      }
      this.index = value.index
      this.messages = value.messages
      this.paths = value.paths
      this.pending = value.pending
      this.ready = value.ready
    }
  }

  touch(...msgIds) {
    const paths = Immutable.Set.of(...msgIds).map(msgId => msgId ? this.paths.get(msgId) : '')
    const newTree = new Tree(this)
    newTree.changeLog = {
      paths,
      prev: this.changeLog,
    }
    return newTree
  }

  addChild(child) {
    let newTree = new Tree(this)
    const parentId = child.parent || null
    newTree.messages = this.messages.set(child.id, child)
    newTree.index = this.index.set(parentId, this.index.get(parentId, Immutable.Map()).set(child.id, child))
    if (!!parentId && !this.ready.has(parentId)) {
      const siblings = this.pending.get(parentId, Immutable.List())
      newTree.pending = this.pending.set(parentId, siblings.push(child))
    } else {
      const path = this.paths.get(parentId) + '/' + child.id
      newTree.paths = this.paths.set(child.id, path)
      newTree.changeLog.paths = newTree.changeLog.paths.add(path)
      newTree.ready = this.ready.add(child.id)
      if (this.pending.has(child.id)) {
        const siblings = this.pending.get(child.id, Immutable.List())
        newTree.pending = this.pending.delete(child.id)
        newTree = siblings.reduce((r, msg) => r.addChild(msg), newTree)
      }
    }
    return newTree
  }

  get(msgId) {
    return this.messages.get(msgId)
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
}
