<template>
    <div id="app" >
        <el-dialog title="请选择访问地址" :visible.sync="showSelect" :close-on-click-modal="false" :show-close="false" :center="true">
             <el-select
             v-model="urlVal"
             filterable
             allow-create
             default-first-option
             placeholder="请选择访问地址"
             clearable
            v-show="showSelect">
             <el-option
             v-for="item in options"
             :key="item.value"
             :label="item.label"
             :value="item.value"
              v-show="showSelect">
             </el-option>
             </el-select>
              <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="selectChanged" size="mini" @keyup.enter="selectChanged">确 定</el-button>
  </span>
  </el-dialog>
    <iframe id="myframe" :src="iframeSrc" width="100%" height="100%" scrolling="no" frameborder="0">
     </iframe>
 </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import {mapState} from 'vuex'
export default {
  name: 'app',
  data () {
    return {
      showSelect: true,
      top: 0,
      left: 0,
      iframeSrc: '',
      options: [{
        value: 'http://10.85.40.105:8081/chis/index',
        label: '甘肃省基层医疗卫生信息系统'
      }, {
        value: 'https://www.baidu.com',
        label: '百度'
      }],
      urlVal: 'http://10.85.40.105:8081/chis/index'
    }
  },
  computed: {
    ...mapState('User', ['userInfo'])
  },
  methods: {
    searchUrl () {
      const _this = this
      if (typeof (Storage) !== 'undefined') {
        if (sessionStorage.getItem('iframeSrc')) {
          _this.showSelect = !_this.showSelect
        } else {
          _this.showSelect = true
        }
      } else {
        console.log('抱歉！您的浏览器不支持 Web Storage ...')
      }
    //   const _this = this
    //   this.$prompt('请输入访问地址', '提示', {
    //     confirmButtonText: '确定',
    //     inputValue: 'https://www.baidu.com',
    //     cancelButtonText: '取消'
    //   }).then(({value}) => {

    //   }).catch(() => {
    //     _this.$message({
    //       type: 'info',
    //       message: '默认跳转到百度'
    //     })
    //     _this.iframeSrc = 'https://www.baidu.com'
    //   })
    },
    selectChanged () {
      const _this = this
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
          _this.iframeSrc = _this.urlVal
          this.showSelect = false
          if (typeof (Storage) !== 'undefined') {
            sessionStorage.setItem('iframeSrc', _this.urlVal)
          } else {
            console.log('抱歉！您的浏览器不支持 Web Storage ...')
          }
        }
      }
    },
    refreshFrame () {
      document.getElementById('myframe').contentWindow.location.reload(true)
    }
  },
  watch: {
    iframeSrc () {
      const iframe = document.querySelector('#myframe')
      // 处理兼容行问题
      if (iframe.attachEvent) {
        iframe.attachEvent('onload', function () {
        // iframe加载完毕以后执行操作
          document.title = document.getElementById('myframe').contentWindow.document.title
        })
      } else {
        iframe.onload = function () {
        // iframe加载完毕以后执行操作
          document.title = document.getElementById('myframe').contentWindow.document.title
        }
      }
    }
  },
  created () {
    const _this = this
    if (typeof (Storage) !== 'undefined') {
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
        background-color: #2B2B2B;
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
    .el-select{
        width: 100%;
    }
    .el-dialog{
        width: 30% !important;
    }
    .el-dialog__body,.el-dialog__footer{
        background-color: #3C3F41 !important;
    }
    .el-message-box{
        background-color: #3C3F41 !important;
        border: 0 !important;
        .el-message-box__content{
            color: wheat;
        }
        .el-message-box__header{
            background-color: whitesmoke;
        }
    }
</style>
