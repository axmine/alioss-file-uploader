import OSS from 'ali-oss'
/**
 * 特性：web直传OSS，断点续传，并发上传，文件上传限制选项
 * 
 * 上传流程：
 * 1. 检查传入的参数是否合法
 * 2. 创建input文件选择器，并检查文件大小，尺寸，类型是否合法
 * 3. 实例化OSS对象并执行上传
 * 4. 返回上传结果
 * 5. 被丢弃的文件(未处理)，实现想法：先传至 temp 中，客户点击保存后移入真正路径中
 */
export class Alioss {
  /**
   * 
   * @param {Object | Function} sts 实例化 OSS 的参数
   * @param {Object} opt 文件上传限制选项，如：大小，类型，尺寸
   * @param {*} callBack 
   */
  async create (sts, opt = {}, callBack) {
    this.fileInput = this.createInput()
    this.fileInput.click()
    this.fileInput.addEventListener('change', async function (e) {
      const blobs = e.path[0].files
      const _this = this
      try {
        // 1. 检查文件类型，大小，尺寸是否合法
        await _this.vaildateFiles(blobs)
        // 2. 开始上传
        _this.doUpload()
      } catch (err) {
        console.log(err)
      }
    })
  }

  /**
   * 开始上传
   */
  doUpload (blobs, sts, callBack) {
    // 1. 请求 sts 参数，并为每个blob设置好要上传的文件名
    files = [
      {
        path: 'a/a.jpg',
        progress: 0,
        checkpoint: ''
      },
      {
        path: 'a/b.jpg',
        progress: 0,
        checkpoint: ''
      },
      {
        path: 'a/c.jpg',
        progress: 0,
        checkpoint: ''
      }
    ]
    // 2. 初始化 oss, 执行上传命令
    const alioss = new OSS(stsConfig)
    const _this = this
    for (let i = 0; i < blobs.length; i++) {
      alioss.multipartUpload(files[i], blobs[i], {
        partSize: _this.setPartSize(blobs[i]),
        progress: async function (p, checkpoint) {
          Object.assign(files[i], {
            progress: Math.floor(p * 100),
            checkpoint
          })
          // 用回调抛出上传进度
          callBack && callBack(files)
        }
      })
    }
  }

  /**
   * 暂停上传
   */
  pause () {}

  /**
   * 续传
   */
  reUpload () {}


}