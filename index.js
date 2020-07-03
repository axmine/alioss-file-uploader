// import OSS from 'ali-oss'
import Base from './src/base.js'
import OSS from 'ali-oss'

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
    this.files = []
  }

  // 创建上传方法
  async create (sts, callBack, options = this.options) {
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
        // await _this.doVaildate(blobs)
        await _this.doVaildate(blobs)
        // 2. 开始上传
        _this.upload(blobs, sts, callBack)
      } catch (err) {
        console.log(err)
      }
    })
  }

  /**
   * 执行上传
   */
  async upload (blobs, sts, callBack) {
    // 1. 生成文件列表
    const list = this.createList(blobs)
    // 2. 获取STS参数
    const { config, files } = await this.getSts(sts, list)
    // 3. 初始化OSS
    const alioss = new OSS(config)
    // 4. 开始上传列表
    list.forEach((e, i) => {
      e.upName = `${files[i]}.${e.extName}`
      this.files[i].name = `${files[i]}.${e.extName}`
      this.do(e, callBack, alioss)
    })
  }

  async do (e, fn, alioss) {
    const _this = this
    // 开始上传
    const { name, res } = await alioss.multipartUpload(e.upName, e.blob, {
      partSize: _this.setPartSize(e.blob),
      progress: async function (progress, checkpoint) {
        _this.files[e.index].progress = Math.floor(progress * 100)
        _this.files[e.index].checkpoint = checkpoint
        fn && fn({
          status: 'loading',
          file: _this.files[e.index],
          list: _this.files
        })
      }
    })

    // 处理结果
    if (name && res.status * 1 === 200) {
      const url = res.requestUrls[0]
      const i = url.indexOf(name)
      let file = url.slice(0, i) + name
      if (this.options.https && file.indexOf('https:') !== 0) {
        file = 'https:' + url.slice(5)
      }
      this.files[e.index].url = file
      fn && fn({
        status: 'complete',
        file: this.files[e.index],
        list: this.files
      })
      // 标记为已完成
      this.files[e.index].complete = true
      // 检查是否全部完成了
      // this.files.forEach(e => e.complete)
      // if (!this.files.some(e => e.complete === false)) {
      //   fileInput.removeEventListener('change')
      // }
    } else {
      const err = { status: false, message: '文件上传失败，请重试' }
      throw err
    }
  }

  createList (blobs) {
    const files = []
    Object.keys(blobs).forEach(i => {
      files.push({
        index: i,
        blob: blobs[i],
        size: blobs[i].size,
        orgName: blobs[i].name,
        extName: '.jpg',
        upName: '',
        url: '',
        progress: 0,
        checkpoint: null
      })
      this.files.push({
        index: i,
        progress: 0,
        size: blobs[i].size,
        file: blobs[i].name,
        name: '',
        url: '',
        checkpoint: null,
        complete: false
      })
    })
    return files
  }

  async getSts (sts, list) {
    let config = {}
    let files = []
    switch (this.getTypeOf(sts)) {
      case 'function': {
        const blobs = []
        list.forEach(e => blobs.push({ size: e.size, name: e.orgName }))
        const res = await sts(blobs)
        config = res.config
        files = res.files
        break
      }
      case 'object':
        config = sts.config
        files = sts.files
        break
    }
    if (!config.stsToken || files.length < 1) {
      throw new Error('STS参数错误，请传入正确的OSS参数')
    }
    return { config, files }
  }
}
