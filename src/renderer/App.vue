<template>
  <div id="app">
    <el-dialog title="系统选择"
               :visible.sync="showSelect"
               :close-on-click-modal="false"
               :show-close="false"
               :center="true"
               :modal='false'
               width="30%"
               v-dialogDrag>
      <el-select v-model="iframeSrc"
                 filterable
                 default-first-option
                 placeholder="请选择访问网址"
                 clearable
                 v-show="showSelect"
                 @change="selectChange">
        <el-option v-for="item in webOptions"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"
                   v-show="showSelect">
        </el-option>
      </el-select>
    </el-dialog>
    <iframe id="myframe"
            :src="iframeSrc"
            width="100%"
            height="100%"
            scrolling="no"
            frameborder="0"
            name="myIframe">
    </iframe>
    <login-cache :current-user="currentUser"></login-cache>
    <drop-menu :style="{left:left+'px',top:top+'px'}"></drop-menu>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import loginCache from '@/views/loginCache'
import dropMenu from '@/components/dropDown/menu'
import config from '@/assets/json/config.json'

export default {
  name: 'app',
  components: {
    loginCache,
    dropMenu
  },
  data () {
    return {
      showSelect: true,
      top: 0,
      left: 0,
      iframeSrc: '',
      loadTimeSet: '',
      currentIframeTitle: '',
      currentUser: {},
      loadingIframe: false
    }
  },
  computed: {
    webOptions () {
      return config.webConfig
    }
  },
  methods: {
    cacheLogin (params) {
      this.currentUser = params
      this.$store.commit('User/SHOW_LOGIN_CACHE_MENU', true)
    },
    getCacheLoginInfo (params) {
      this.top = params.positionY - 40
      this.left = params.positionX - 10
      this.$store.commit('User/SHOW_DROP_MENU', true)
      this.$store.commit('User/IS_CACHED', localStorage.length > 0)
    },
    searchUrl () {
      const _this = this
      if (typeof Storage !== 'undefined') {
        if (sessionStorage.getItem('iframeSrc')) {
          _this.showSelect = !_this.showSelect
        } else {
          _this.showSelect = true
        }
      } else {
        console.log('抱歉！您的浏览器不支持 Web Storage ...')
      }
    },
    selectChange () {
      const _this = this
      document.title = ''
      if (_this.iframeSrc == null || _this.iframeSrc.length === 0) {
        _this.$message({
          type: 'info',
          message: '内容不能为空!'
        })
      } else {
        // eslint-disable-next-line no-useless-escape
        var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/
        var objExp = new RegExp(Expression)
        if (!objExp.test(_this.iframeSrc)) {
          _this.$message({
            type: 'error',
            message: '请输入正确的网址'
          })
        } else {
          if (typeof Storage !== 'undefined') {
            sessionStorage.setItem('iframeSrc', _this.iframeSrc)
          } else {
            console.log('抱歉！您的浏览器不支持 Web Storage ...')
          }
        }
      }
    },
    refreshFrame () {
      document.getElementById('myframe').contentWindow.location.reload(true)
    },
    doAfterIframeLoaded () {
      this.currentIframeTitle = document.getElementById(
        'myframe'
      ).contentWindow.document.title
    }
  },
  watch: {
    currentIframeTitle () {
      if (this.currentIframeTitle !== '') {
        document.title = this.currentIframeTitle
        this.showSelect = false
        clearInterval(this.loadTimeSet)
      }
    },
    iframeSrc: {
      handler (newVal) {
        const iframe = document.querySelector('#myframe')
        // 处理兼容行问题
        const _this = this
        var iframeLoadTimeout = setTimeout(function () {
          if (document.title === '') {
            _this.$notify.error({
              title: '错误',
              message: '该系统无法连接，请切换其他系统'
            })
            _this.showSelect = true
            clearInterval(_this.loadTimeSet)
          }
        }, 10000)
        if (iframe.attachEvent) {
          iframe.attachEvent('onload', function () {
            // iframe加载完毕以后执行操作
            clearTimeout(iframeLoadTimeout)
          })
        } else {
          iframe.onload = function () {
            // iframe加载完毕以后执行操作
            clearTimeout(iframeLoadTimeout)
          }
        }
        this.loadTimeSet = setInterval(function () {
          _this.doAfterIframeLoaded()
        }, 1000)
      },
      deep: true
    }
  },
  mounted () {
    const _this = this
    window.addEventListener('message', event => {
      // 根据上面制定的结构来解析iframe内部发回来的数据
      const data = event.data
      switch (data.cmd) {
        case 'cacheLoginInfo':
          _this.cacheLogin(data.params)
          break
        case 'getCacheLoginInfo':
          _this.getCacheLoginInfo(data.params)
          break
      }
    })
  },
  beforeDestroy () {
    window.removeEventListener('message')
  },
  created () {
    const _this = this
    document.title = ''
    if (typeof Storage !== 'undefined') {
      if (sessionStorage.getItem('iframeSrc')) {
        _this.iframeSrc = sessionStorage.getItem('iframeSrc')
        _this.showSelect = false
      } else {
        _this.iframeSrc = config.webDefault
        _this.showSelect = true
      }
    } else {
      console.log('抱歉！您的浏览器不支持 Web Storage ...')
    }

    ipcRenderer.on('showSelect', (event, arg) => {
      _this.searchUrl()
    })
    ipcRenderer.on('reloadIframe', (event, arg) => {
      _this.refreshFrame()
    })
  }
}
</script>

<style lang="scss">
/* CSS */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: arial, 'Hiragino Sans GB', 'Microsoft YaHei',
    'WenQuanYi Micro Hei', sans-serif;
  background: white;
}

* {
  box-sizing: border-box;
}

#app {
  height: 100%;
  -webkit-app-region: no-drag;
  background-color: #2b2b2b;
  color: wheat;
  overflow: hidden;
}

::-webkit-scrollbar-track-piece {
  background-color: #fff;
  -webkit-border-radius: 1em;
  -moz-border-radius: 1em;
  border-radius: 1em;
}

/*滚动条的宽度*/
::-webkit-scrollbar {
  width: 8px;
}

/*滚动条的设置*/
::-webkit-scrollbar-thumb {
  background-color: #45484a;
  background-clip: padding-box;
  -webkit-border-radius: 1em;
  -moz-border-radius: 1em;
  border-radius: 1em;
}
.el-select {
  width: 100%;
}
.el-dialog__body,
.el-dialog__footer {
  color: wheat !important;
  background-color: #3c3f41 !important;
}
.el-message-box {
  background-color: #3c3f41 !important;
  border: 0 !important;
  .el-message-box__content {
    color: wheat;
  }
  .el-message-box__header {
    background-color: whitesmoke;
  }
}
</style>
