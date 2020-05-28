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
      <el-select v-model="urlVal"
                 filterable
                 allow-create
                 default-first-option
                 placeholder="可输入访问网址"
                 clearable
                 v-show="showSelect">
        <el-option v-for="item in options"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"
                   v-show="showSelect">
        </el-option>
      </el-select>
      <span slot="footer"
            class="dialog-footer">
        <el-button type="primary"
                   @click="selectChanged"
                   size="mini"
                   @keyup.enter="selectChanged" :loading="loadingIframe">确 定</el-button>
      </span>
    </el-dialog>
    <iframe id="myframe"
            :src="iframeSrc"
            width="100%"
            height="100%"
            scrolling="no"
            frameborder="0"
            name="myIframe">
    </iframe>
    <login-cache :login-cache-dialog="showLoginCacheDialog" :current-user="currentUser"></login-cache>
    <drop-menu v-show="dropVisible" :style="{left:left+'px',top:top+'px'}"></drop-menu>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapState } from 'vuex'
import loginCache from '@/views/loginCache'
import dropMenu from '@/components/dropDown/menu'
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
      dropVisible: false,
      iframeSrc: '',
      loadTimeSet: '',
      currentIframeTitle: '',
      currentUser: {},
      isIframeLoadedTimeOut: false,
      loadingIframe: false,
      showLoginCacheDialog: false,
      options: [
        {
          value: 'http://10.85.40.105:8081/chis/index',
          label: '甘肃省基层医疗卫生信息系统'
        },
        {
          value: 'https://www.baidu.com',
          label: '百度'
        },
        {
          value: 'http://127.0.0.1:8081/chis/index',
          label: '邹城市基层医疗卫生信息系统'
        }
      ],
      urlVal: 'http://10.85.40.105:8081/chis/index'
    }
  },
  computed: {
    ...mapState('User', ['userInfo'])
  },
  methods: {
    cacheLogin (params) {
      this.showLoginCacheDialog = true
      this.currentUser = params
    },
    getCacheLoginInfo (params) {
      console.log(params)
      this.top = params.positionY - 40
      this.left = params.positionX - 10
      this.dropVisible = true
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
    selectChanged () {
      const _this = this
      this.loadingIframe = false
      if (_this.urlVal == null || _this.urlVal.length === 0) {
        _this.$message({
          type: 'info',
          message: '内容不能为空!'
        })
      } else {
        // eslint-disable-next-line no-useless-escape
        var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/
        var objExp = new RegExp(Expression)
        if (!objExp.test(_this.urlVal)) {
          _this.$message({
            type: 'error',
            message: '请输入正确的网址'
          })
        } else {
          if (_this.iframeSrc === _this.urlVal) {
            _this.refreshFrame()
            _this.searchUrl()
          } else {
            _this.loadingIframe = true
            _this.iframeSrc = _this.urlVal
            if (typeof Storage !== 'undefined') {
              sessionStorage.setItem('iframeSrc', _this.urlVal)
            } else {
              console.log('抱歉！您的浏览器不支持 Web Storage ...')
            }
          }
        }
      }
    },
    refreshFrame () {
      document.getElementById('myframe').contentWindow.location.reload(true)
    },
    doAfterIframeLoaded () {
      this.currentIframeTitle = document.getElementById('myframe').contentWindow
        .document.title
    }
  },
  watch: {
    isIframeLoadedTimeOut () {
      if (this.currentIframeTitle === '') {
        this.$notify.error({
          title: '错误',
          message: '该系统无法连接，请切换其他系统'
        })
        this.showSelect = true
        this.loadingIframe = false
        clearInterval(this.loadTimeSet)
      }
    },
    currentIframeTitle () {
      if (this.currentIframeTitle !== '') {
        document.title = this.currentIframeTitle
        this.showSelect = false
        this.loadingIframe = false
        clearInterval(this.loadTimeSet)
      }
    },
    iframeSrc: {
      handler (newVal) {
        const iframe = document.querySelector('#myframe')
        // 处理兼容行问题
        const _this = this
        var iframeLoadTimeout = setTimeout(function () {
          _this.isIframeLoadedTimeOut = true
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
  created () {
    const _this = this
    this.loadingIframe = true
    if (typeof Storage !== 'undefined') {
      if (sessionStorage.getItem('iframeSrc')) {
        _this.iframeSrc = sessionStorage.getItem('iframeSrc')
        _this.showSelect = false
      } else {
        _this.iframeSrc = _this.urlVal
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
