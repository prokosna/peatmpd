export default {
  currentProfile: state => {
    return state.profiles.find(p => p.id === state.currentProfileId)
  }
}
