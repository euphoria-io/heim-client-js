import Immutable from 'immutable'

class Node {
  constructor(message, followups=Immutable.OrderedSet()) {
    this.message = message
    this.followups = followups
  }

  addFollowup(message) {
    return new Node(this.message, this.followups.add(new Node(message)))
  }
}

export default class Tree {
  constructor(nodes=Immutable.Map(), rel=Immutable.Map()) {
    this.nodes = nodes
    this.rel = rel
  }

  addChild(parentId, childId, child) {
    const siblings = this.rel.get(parentId, Immutable.OrderedSet())
    if (siblings.size) {
      const lastSiblingId = siblings.last()
      const lastSibling = this.nodes.get(lastSiblingId)
      if (lastSibling && lastSibling.message.sender.id === child.sender.id) {
        const followedUp = lastSibling.addFollowup(child)
        const nodes = this.nodes.set(lastSiblingId, followedUp).set(childId, followedUp)
        //const children = this.rel.get(parentId, Immutable.OrderedSet()).add(childId)
        //const rel = this.rel.set(parentId, children)
        return new Tree(nodes, this.rel)
      }
    }
    const nodes = this.nodes.set(childId, new Node(child))
    const children = this.rel.get(parentId, Immutable.OrderedSet()).add(childId)
    const rel = this.rel.set(parentId, children)
    return new Tree(nodes, rel)
  }

  childrenOf(parentId) {
    return this.rel.get(parentId, Immutable.OrderedSet())
  }
}
