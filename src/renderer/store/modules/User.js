import {getRequest} from '../../utils/api'
import {checkIsAdmin} from '../../utils/utils'

let state = {
  dialogFormVisible: false,
  userInfo: {}
}
let getters = {
  hasUserInfo: state => state.userInfo.nickname && state.userInfo.nickname !== '未登录',
  isAdmin: state => checkIsAdmin(state.userInfo.roles)
}

let mutations = {
  SET_SHOW_LOGIN (state, val) {
    state.dialogFormVisible = val
  },
  SET_USER_INFO (state, loadUser) {
    state.userInfo = loadUser
  },
  LOGIN_IN (state, user) {
    state.userInfo = user
    sessionStorage.setItem('user', JSON.stringify(user))
  }
}

let actions = {
  setShowLogin ({commit}, val) {
    commit('SET_SHOW_LOGIN', val)
  },
  async logout ({commit}) {
    let {status} = await getRequest('/fsblog/api/logout')
    if (status === 200) {
      sessionStorage.removeItem('user')
      commit('SET_USER_INFO', {nickname: '未登录'})
    }
  }
}

export default {namespaced: true, state, getters, mutations, actions}
