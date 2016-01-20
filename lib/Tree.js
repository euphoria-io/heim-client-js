import Immutable from 'immutable'

// The Tree maintains the state of all displayed messages. It also serves as
// a holding area for known messages that can't be displayed because their
// ancestors haven't been loaded.
// 
// - index: map of msgId to ancestor path. The path is an ordered set of
//     msgIds. Entries in the index are displayable.
// - nodes: map of msgId to message.
// - orphans: map of parentId to ordered set of childIds. Orphans are known
//     messages whose ancestry is not fully loaded.
export default class Tree {
  constructor(index=Immutable.Map(), nodes=Immutable.Map(), orphans=Immutable.Map(), rel=Immutable.Map()) {
    this.index = index
    this.nodes = nodes
    this.orphans = orphans
    this.rel = rel
  }

  // Add a message to the tree. If its ancestor isn't in the tree, then it
  // goes into orphans.
  addChild(parentId, childId, child, greedy=false) {
    child = {...child, _greedy: greedy}
    if (parentId && !this.index.has(parentId)) {
      return this._addOrphan(parentId, childId, child)
    }

    const path = this.index.get(parentId)
    const childPath = path ? path.add(childId) : Immutable.OrderedSet.of(childId)
    const index = this.index.set(childId, childPath)
    const nodes = this.nodes.set(childId, child)
    const children = this.rel.get(parentId, Immutable.OrderedSet()).add(childId)
    const rel = this.rel.set(parentId, children)
    const newTree = new Tree(index, nodes, this.orphans, rel)

    if (this.orphans.has(childId)) {
      return newTree._adoptOrphans(childId)
    }
    return newTree
  }

  _addOrphan(parentId, childId, child) {
    const family = this.orphans.get(childId, Immutable.OrderedSet())
    
    // If this is the ancestor of _greedy orphans, then it should be greedy too.
    if (!child._greedy && family) {
      family.forEach(orphanId => {
        const orphan = this.nodes.get(orphanId)
        if (orphan && orphan._greedy) {
          child._greedy = true
          return false
        }
        return true
      })
    }

    const nodes = this.nodes.set(childId, child)
    const orphans = this.orphans.set(parentId, family.add(childId))
    return new Tree(this.index, nodes, orphans, this.rel)
  }

  _adoptOrphans(parentId) {
    const family = this.orphans.get(parentId)
    const orphans = this.orphans.delete(parentId)
    const reducer = (r, msgId) => r.addChild(parentId, msgId, this.nodes.get(msgId))
    return family.reduce(reducer, new Tree(this.index, this.nodes, orphans, this.rel))
  }

  childrenOf(parentId) {
    return this.rel.get(parentId, Immutable.Set()).sortBy((v, k) => k)
  }

  needMore() {
    if (this.index.size > 500) {
      return false
    }

    const toFetch = this.orphans.filter((childIds, parentId) => {
      if (this.oldestMsgId && parentId >= this.oldestMsgId) {
        return false
      }
      if (this.nodes.has(parentId)) {
        return false
      }
      return !!childIds.filter(msgId => this.nodes.get(msgId)._greedy).first()
    }).size

    return !!toFetch
  }
}
