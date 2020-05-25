import Vue from 'vue'
import App from './App'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './utils/filter_utils.js'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false
Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  components: {App},
  store,
  template: '<App/>'
}).$mount('#app')
