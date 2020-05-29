let state = {
  dropVisible: false,
  showLoginCacheDialog: false,
  isCached: false
}

let getters = {

}
let mutations = {
  SHOW_DROP_MENU (state, val) {
    state.dropVisible = val
  },
  SHOW_LOGIN_CACHE_MENU (state, val) {
    state.showLoginCacheDialog = val
  },
  IS_CACHED (state, val) {
    state.isCached = val
  }
}

let actions = {
  showDropMenu ({ commit }, val) {
    commit('SHOW_DROP_MENU', val)
  },
  showLoginCacheMenu ({ commit }, val) {
    commit('SHOW_LOGIN_CACHE_MENU', val)
  },
  isCached ({ commit }, val) {
    commit('IS_CACHED', val)
  }
}

export default { namespaced: true, state, getters, mutations, actions }
