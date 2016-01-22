export default engine => {
  return {
    load() {
      return engine.load()
    },

    save(state) {
      const saveState = {
        roomNames: state.chatSwitch.chats.keys(),
      }
      return engine.save(saveState)
    },
  }
}
