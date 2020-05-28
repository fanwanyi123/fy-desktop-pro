<template>
  <ul class="contextmenu">
    <li v-for="item in cacheLoginInfo"
        :key="item.id"
        v-bind="item" @click="userSelect(item)">{{item.id}}</li>
  </ul>
</template>

<script>
export default {
  name: 'dropMenu',
  data () {
    return {}
  },
  computed: {
    cacheLoginInfo () {
      let userInfo = []
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i) // 获取本地存储的Key
        userInfo.push({ id: key, label: localStorage.getItem(key) })
      }
      return userInfo
    }
  },
  props: {},
  methods: {
    userSelect () {

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
  border-radius: 4px;
  color: black;
  li {
    margin: 0;
    padding: 2px 16px;
    cursor: pointer;
    text-align: center;
    &:hover {
      color: #ffd04b;
    }
  }
}
</style>
