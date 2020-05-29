<template>
  <div class="loginCache">
    <el-dialog title="要保存当前账号信息吗"
               :visible.sync="showLoginCacheDialog"
               width="20%"
               :modal='false'
               v-dialogDrag
               style="float:right">
      <span>
        <div class="flexDiv"><span class="divWidth">用户名:</span>
          <el-input v-model="input"></el-input>
        </div>
        <div class="flexDiv"><span class="divWidth">密码:</span>
          <el-input v-model="input"></el-input>
        </div>
      </span>
      <span slot="footer"
            class="dialog-footer">
        <el-button type="primary"
                   size="mini"
                   @click="cacheLoginInfo(true)">保存</el-button>
        <el-button @click="cacheLoginInfo(false)"
                   size="mini">不保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'loginCache',
  props: {
    currentUser: Object
  },
  computed: {
    ...mapState('User', ['showLoginCacheDialog'])
  },
  data () {
    return {
      input: '********'
    }
  },
  methods: {
    cacheLoginInfo (param) {
      if (param) {
        if (typeof Storage !== 'undefined') {
          localStorage.setItem(
            this.currentUser.userName,
            this.currentUser.passWord
          )
        } else {
          console.log('抱歉！您的浏览器不支持 Web Storage ...')
        }
      }
      this.$store.commit('User/SHOW_LOGIN_CACHE_MENU', false)
    }
  }
}
</script>

<style lang="scss">
.loginCache {
  .el-input {
    width: 60%;
  }
  .divWidth {
    width: 40%;
  }
  .flexDiv {
    display: flex;
    justify-content: flex-start;
  }
  .el-dialog {
    position: absolute;
    right: 0;
  }
}
</style>
