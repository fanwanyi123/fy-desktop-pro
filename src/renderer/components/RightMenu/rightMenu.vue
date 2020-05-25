<template>
    <ul  class="contextmenu">
        <li @click="shareFile(selectedFile,1)" v-show="state===1&&selectedFile.share===0"><i
                class="fa fa-unlock-alt"></i>共享
        </li>
        <li @click="shareFile(selectedFile,0)" v-show="state===1&&selectedFile.share===1"><i class="fa fa-lock"></i>私密
        </li>
        <li @click="downloadFile(selectedFile)"><i class="fa fa-download"></i>下载</li>

        <li @click="deleteFile(selectedFile,1)" v-show="state===1"><i
                class="fa fa-trash-o"></i>删除
        </li>
        <li @click="searchFile" v-show="state===1"><i
                class="fa fa-search"></i>检索
        </li>
    </ul>
</template>

<script>
    import {putRequest, postRequest} from '@/utils/api'
    import eventBus from '@/eventBus/searchResult'
    export default {
      name: 'rightMenu',
      data () {
        return {
          shareFiles: [],
          fileId: [],
          filePath: []
        }
      },
      props: {
        selectedFile: Object,
        state: Number
      },
      methods: {
        downloadFile (file) {
          let elemIf = document.createElement('iframe')
          elemIf.src = '/fsblog/api/download/file?path=' + file.path
          elemIf.style.display = 'none'
          document.body.appendChild(elemIf)
        },
        shareFile (file, share) {
          const _this = this
          _this.shareFiles.push(file.id)
          putRequest('/fsblog/api/shareFiles', {share: share, fileIds: _this.shareFiles}).then(resp => {
            if (resp.status === 200) {
              let data = resp.data
              _this.$message({type: data.status, message: data.msg})
              eventBus.$emit('refresh')
            } else {
              _this.$message({type: 'error', message: '设置失败!'})
            }
            _this.shareFiles = []
          }, resp => {
            _this.$message({type: 'error', message: '设置失败!'})
            _this.shareFiles = []
          })
        },
        deleteFile (file) {
          let _this = this
          _this.fileId.push(file.id)
          _this.filePath.push(file.path)
          this.$confirm('确定永久删除该文件么⊙_⊙?', file.name, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            iconClass: 'fa fa-bullhorn'
          }).then(() => {
            let url = '/fsblog/api/file/delete'
            putRequest(url, {fileIds: _this.fileId, filePaths: _this.filePath}).then(resp => {
              if (resp.status === 200) {
                let data = resp.data
                _this.$message({type: data.status, message: data.msg})
                if (data.status === 'success') {
                  eventBus.$emit('refresh')
                }
              } else {
                _this.$message({type: 'error', message: '删除失败!'})
              }
              _this.fileId = []
              _this.filePath = []
            }, resp => {
              _this.$message({type: 'error', message: '删除失败!'})
              _this.fileId = []
              _this.filePath = []
            })
          }).catch(() => {
            _this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
        },
        searchFile () {
          const _this = this
          this.$prompt('请输入检索内容', _this.selectedFile.name, {
            confirmButtonText: '检索',
            inputValue: '',
            cancelButtonText: '取消'
          }).then(({value}) => {
            // value就是输入值
            if (value == null || value.length === 0) {
              _this.$message({
                type: 'info',
                message: '数据不能为空!'
              })
            } else {
              postRequest('/fsblog/api/fileContent/search', {file: JSON.stringify(_this.selectedFile), searchVal: value}).then(resp => {
                const json = resp.data
                _this.$message({
                  type: json.status,
                  message: json.msg
                })
                eventBus.$emit('refresh')
              }, resp => {
                if (resp.response && resp.response.status && resp.response.status === 403) {
                  _this.$message({
                    type: 'error',
                    message: resp.response.data
                  })
                }
              })
            }
          }).catch(() => {
            _this.$message({
              type: 'info',
              message: '取消检索'
            })
          })
        }
      }
    }
</script>

<style lang="scss">
    .contextmenu {
        background: rgba(255, 0, 102, 0.66);
        z-index: 3000;
        position: absolute;
        list-style-type: none;
        padding: 5px 0;
        border-radius: 4px;
        color: wheat;
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
