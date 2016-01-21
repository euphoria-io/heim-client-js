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
}
