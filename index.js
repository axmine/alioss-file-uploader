import Base from './src/base.js'
export class Alioss extends Base {
  constructor () {
    const options = {
      accept: '',
      size: { width: 0, height: 0, scale: 1, aspectRatio: '', error: 0 },
      limit: { min: 0, max: 10, unit: 'mb' },
      https: true,
      multiple: false
    }
    super(options)
  }

  // 创建上传方法
  async upload (sts, callBack, options = this.options) {
    Object.assign(this.options, options)
    // 格式化参数
    this.options.size = this.formatSize(this.options.size)
    this.options.limit = this.formatLimit(this.options.limit)
    this.options.accept = this.formatAccept(this.options.accept)
    // 创建元素
    const fileInput = this.createInput()
    fileInput.click()
    const _this = this
    fileInput.addEventListener('change', async function (e) {
      const blobs = e.path[0].files
      try {
        // 1. 检查文件类型，大小，尺寸是否合法
        await _this.doVaildate(blobs)
        // 2. 开始上传
        _this.create(blobs, sts, callBack)
      } catch (err) {
        throw err
      }
    })
  }
}
