import Immutable from 'immutable'

export default class Tree {
  constructor(value=null) {
    if (!value) {
      this.index = Immutable.Map()
      this.messages = Immutable.Map()
      this.pending = Immutable.Map()
      this.ready = Immutable.Set()
    } else {
      this.index = value.index
      this.messages = value.messages
      this.pending = value.pending
      this.ready = value.ready
    }
  }

  addChild(child) {
    let newTree = new Tree(this)
    newTree.messages = this.messages.set(child.id, child)
    newTree.index = this.index.set(child.parent, this.index.get(child.parent, Immutable.Map()).set(child.id, child))
    if (!!child.parent && !this.ready.has(child.parent)) {
      const siblings = this.pending.get(child.parent, Immutable.List())
      newTree.pending = this.pending.set(child.parent, siblings.push(child))
    } else {
      newTree.ready = this.ready.add(child.id)
      if (this.pending.has(child.id)) {
        const reducer = (r, msg) => r.addChild(msg)
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
