<template>
  <ul class="contextmenu"
      v-show="dropVisible && isCached">
    <li v-for="item in cacheLoginInfo"
        :key="item.uname"
        v-bind="item"
        @click="userSelect(item)">{{item.uname}}&nbsp;<br>********</li>
  </ul>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'dropMenu',
  data () {
    return {}
  },
  computed: {
    ...mapState('User', ['dropVisible', 'isCached']),
    cacheLoginInfo () {
      let userInfo = []
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i) // 获取本地存储的Key
        userInfo.push({ uname: key, pwd: localStorage.getItem(key) })
      }
      return userInfo
    }
  },
  props: {},
  methods: {
    userSelect (item) {
      document.getElementById('myframe').contentWindow.postMessage(
        {
          cmd: 'getCacheLoginInfo',
          params: {
            userName: item.uname,
            passWord: item.pwd
          }
        },
        '*'
      )
      this.$store.commit('User/SHOW_DROP_MENU', false)
    }
  }
}
</script>

<style lang="scss">
.contextmenu {
  width: 100px;
  background: white;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 5px 0;
  color: black;
  li {
    margin: 0;
    padding: 2px 16px;
    cursor: pointer;
    &:hover {
      background-color: rgba(128, 128, 128, 0.514);
    }
  }
}
</style>
