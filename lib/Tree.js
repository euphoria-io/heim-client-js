import Immutable from 'immutable'

export default class Tree {
  constructor(index=Immutable.Map(), nodes=Immutable.Map(), rel=Immutable.Map()) {
    this.index = index
    this.nodes = nodes
    this.rel = rel
  }

  addChild(parentId, childId, child) {
    const path = this.index.get(parentId)
    const childPath = path ? path.add(childId) : Immutable.OrderedSet.of(childId)
    const index = this.index.set(childId, childPath)
    const nodes = this.nodes.set(childId, child)
    const children = this.rel.get(parentId, Immutable.OrderedSet()).add(childId)
    const rel = this.rel.set(parentId, children)
    return new Tree(index, nodes, rel)
  }

  childrenOf(parentId) {
    return this.rel.get(parentId, Immutable.OrderedSet())
  }
}
