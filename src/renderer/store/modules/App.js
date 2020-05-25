const state = {
  redirect: '/'
}
const mutations = {
  SET_REDIRECT (state, url) {
    state.redirect = url
  }
}
export default {
  namespaced: true,
  state,
  mutations
}
