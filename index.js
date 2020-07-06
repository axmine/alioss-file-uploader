import { formatAccept, formatLimit, formatSize, createInput, doVaildate, createUploader } from './src/utils'
//   0: '文件类型不符合要求，请重新选择',
//   1: '该文件似乎是一个空文件，暂不支持空文件上传',
//   2: '文件太大，应介于最小值与最大值之间',
//   3: '文件太大，不得大于最大值',
//   4: '文件太小，应介于最小值与最大值之间',
//   5: '文件太小，不得小于最小值',
//   6: '此错误代码暂未定义'
//   7: '图片尺寸不符',
//   8: '图片误差过大',
//   9: '文件上传失败'
export class Alioss {
  constructor () {
    this.options = {
      accept: '',
      size: { width: 0, height: 0, scale: 1, aspectRatio: '', error: 0 },
      limit: { min: 0, max: 10, unit: 'mb' },
      https: true,
      multiple: false
    }
  }

  upload (sts, callBack, options = this.options) {
    // 1. merge options
    Object.assign(this.options, options)
    // 2. format values
    Object.assign(this.options, {
      size: formatSize(this.options.size),
      accept: formatAccept(this.options.accept),
      limit: formatLimit(this.options.limit)
    })
    // 3. create input
    const input = createInput(options)
    input.click()
    const _this = this
    input.addEventListener('change', async function (e) {
      const blobs = e.path[0].files
      try {
        // 3-1. vaildate files
        await doVaildate(blobs, _this.options)
        // 3-2. upload file
        createUploader(blobs, sts, callBack, _this.options)
      } catch (err) {
        // throw err
        callBack(Object.assign(err, { status: 'error' }))
      }
    })
  }
}