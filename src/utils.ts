import * as OSS from 'ali-oss'
import {
  Sts,
  StsConfig,
  OptionsSize,
  OptionsLimit,
  OptionsLimitOutPut,
  Options,
  realImageSize
} from './Dto/Types.dto'
const lists = []
// 格式化 options.size 的值
export function formatSize(size: OptionsSize):OptionsSize {
  const s = Object.assign({ width: 0, height: 0, scale: 1, error: 0, aspectRatio: '' }, size)
  const { height = 0, width = 0, scale = 1, error = 0, aspectRatio = '' } = s
  if (height < 0 || width < 0) {
    throw new Error('height or width is a positive integer or zero')
  }
  if (scale < 0) {
    throw new Error('scale is a positive integer or zero')
  }
  if (error < 0) {
    throw new Error('error is positive integer or  0 < float < 1 or 0, default value is 0')
  }
  if (aspectRatio !== '') {
    const ratio = aspectRatio.split(':')
    let r0 = parseInt(ratio[0], 10)
    let r1 = parseInt(ratio[1], 10)
    if (!(/\d+:\d+/.test(aspectRatio))) {
      throw new Error('aspectRatio\'s value is a string, like this: \'16:9\'')
    } else if (height > 0 && width > 0) {
      const w = width / r0
      const h = height / r1
      if (w !== Math.floor(w) || h !== Math.floor(h) || w !== h) {
        throw new Error('it\'s can\'t complete calculation by aspectratio、with、height')
      }
    } else if (height > 0) {
      const h = height / r1
      if (h !== Math.floor(h)) {
        throw new Error('aspectratio or height is not a suitable number')
      }
    } else if (width > 0) {
      const w = width / r0
      if (w !== Math.floor(w)) {
        throw new Error('aspectratio or width is not a suitable number')
      }
    }
    // 校组定义的比例是否合理
  }
  return {
    height,
    width,
    scale: Math.floor(scale * 100) / 100,
    error: error < 1 ? error : Math.floor(error),
    aspectRatio
  }
}

// 格式化 options.limit 的值
export function formatLimit(val: OptionsLimit): OptionsLimitOutPut {
  const { min = 0, max = 0, unit = 'mb' } = val
  if (getTypeOf(min) !== 'number' || getTypeOf(max) !== 'number') {
    throw new Error('min or max must be number')
  }
  if (min < 0 || max < 0) {
    throw new Error('min or max must be a positive integer or zero')
  }
  if (min > max && max !== 0) {
    throw new Error('if max > 0, then: min must less than max or equal max')
  }
  // const aUnit: Array<string> =
  if (!['kb', 'mb', 'gb', 'tb'].includes(unit.toLowerCase())) {
    throw new Error('limit.unit must be：\'kb\'|\'mb\'|\'gb\'|\'tb\'')
  }
  const units = { kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 }
  return {
    min: Math.floor(min * units[unit.toLowerCase()]), // 格式化后的字节单位
    max: Math.floor(max * units[unit.toLowerCase()]), // 格式化后的字节单位
    oMin: min, // 传入的原始大小
    oMax: max, // 传入的原始大小
    oUnit: unit.toUpperCase() // 传入的原始单位
  }
}

// 格式化 options.accept 的值
export function formatAccept(val: string | Array<string>): string | Array<string> {
  let accept = val
  if (Array.isArray(accept)) {
    for (let i = 0; i < accept.length; i++) {
      accept.splice(i, 1, accept[i].toLowerCase())
      accept[i].indexOf('.') === 0 && accept.splice(i, 1, accept[i].slice(1))
    }
    return accept
  }
  if (typeof accept === 'string') {
    accept = accept.toLowerCase()
    if (accept.indexOf('.') === 0) {
      accept = accept.slice(1)
    }
    return accept
  }
}

// 执行检查
export async function doVaildate (blobs, options): Promise<void> {
  // blobs.forEach(blob => {
  for (let i = 0; i < blobs.length; i++) {
    // 1、校验文件类型是否符合
    vaildateFileType(blobs[i], options)
    // 2、校验文件大小是否符合
    vaildateFileLimit(blobs[i], options)
    // 3、校验图片尺寸大小
    if (blobs[i].type.indexOf('image') === 0) {
      await vaildateImageSize(blobs[i], options)
    }
  }
}

// 创建 <input type="file" />对象
export function createInput (options: Options): any {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  if (options.multiple) { fileInput.multiple = true }
  return fileInput
}

export async function createUploader (blobs, sts, callBack, options) {
  // 1. 生成文件列表
  const list = createList(blobs)
  // 2. 获取STS参数
  const { config, files } = await getSts(sts, list)
  // 3. 初始化OSS
  const alioss = new OSS(config)
  // 4. 开始上传列表
  lists.length = 0
  list.forEach((e, i) => {
    e.upName = `${files[i]}.${e.extName}`
    lists.push({
      index: i,
      progress: 0,
      size: e.size,
      file: e.orgName,
      name: e.upName,
      url: '',
      checkpoint: null,
      complete: false
    })
    multipartUpload(e, callBack, alioss, options)
  })
}

// 生成上传列表
function createList (blobs) {
  const list = []
  Object.keys(blobs).forEach(i => {
    list.push({
      index: i,
      blob: blobs[i],
      size: blobs[i].size,
      orgName: blobs[i].name,
      extName: getExtName(blobs[i].name),
      upName: '',
      url: '',
      progress: 0,
      checkpoint: null
    })
  })
  return list
}

// 分片上传方法
async function multipartUpload (e, fn, alioss, options) {
  // const _this = this
  // 开始上传
  const { name, res } = await alioss.multipartUpload(e.upName, e.blob, {
    partSize: setPartSize(e.blob),
    progress: async function (progress, checkpoint) {
      lists[e.index].progress = Math.floor(progress * 100)
      lists[e.index].checkpoint = checkpoint
      fn && fn({
        status: 'loading',
        file: lists[e.index],
        list: lists
      })
    }
  })

  // 处理结果
  if (name && res.status * 1 === 200) {
    const url = res.requestUrls[0]
    const i = url.indexOf(name)
    let file = url.slice(0, i) + name
    if (options.https && file.indexOf('https:') !== 0) {
      file = 'https:' + url.slice(5)
    }
    lists[e.index].url = file
    lists[e.index].complete = true
    lists.map(ele => {
      const i = ele.url.indexOf(ele.name)
      ele.url = ele.url.slice(0, i) + ele.name
    })
    fn && fn({
      status: 'complete',
      file: lists[e.index],
      list: lists
    })
    // 标记为已完成
    // 检查是否全部完成了
    // this.files.forEach(e => e.complete)
    //   fileInput.removeEventListener('change')
    // }
  } else {
    const err = {
      status: 'error',
      code: 9,
      file: lists[e.index],
      list: lists,
      message: '文件上传失败，请重试'
    }
    throw err
  }
}

async function getSts (sts, list): Promise<Sts> {
  let config: StsConfig
  let files: Array<string> = []
  switch (getTypeOf(sts)) {
    case 'function': {
      const blobs = []
      list.forEach(e => blobs.push({ size: e.size, name: e.orgName }))
      const res = await sts(blobs)
      if (res) {
        config = res.config
        files = res.files
      }
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

// 验证文件类型
function vaildateFileType (blob, options: Options): boolean {
  let bool = options.accept === ''
  if (options.accept !== '') {
    const { type, name } = blob
    if (Array.isArray(options.accept)) {
      bool = options.accept.some(e => e === getExtName(name))
    }
    if (typeof options.accept === 'string') {
      bool = type.indexOf(options.accept) === 0
    }
    // 抛出错误
    if (!bool) {
      const err = {
        status: 'error',
        code: 0,
        message: '文件类型不符合要求, 请重新选择',
        file: name
      }
      throw err
    }
  }
  return bool
}

// 验证文件大小
function vaildateFileLimit (blob, options): boolean {
  const { min, max, oMin, oMax, oUnit } = options.limit
  let bool = true
  if (max > 0) {
    const { name, size } = blob
    const err = {
      status: 'error',
      code: 2,
      file: name,
      message: '',
      limit: {
        min: oMin,
        max: oMax,
        unit: oUnit
      }
    }
    // 禁止上传空文件
    if (size < 1) {
      bool = false
      err.message = '该文件似乎是一个空文件，不支持上传空文件'
      err.code = 1
    } else if (size > max) {
      bool = false
      const msg = oMin > 0 ? `应介于 ${oMin}-${oMax}${oUnit} 之间` : `不得大于 ${oMax}${oUnit}`
      err.code = oMin > 0 ? 2 : 3
      err.message = `文件太大，${msg}`
    } else if (size < min) {
      bool = false
      err.message = `文件太小，应介于 ${oMin}-${oMax}${oUnit} 之间`
      err.code = oMax > 0 ? 4 : 5
    }
    if (!bool) { throw err }
  }
  return bool
}

// 验证图片尺寸
async function vaildateImageSize (blob, options): Promise<boolean> {
  const { width, height, error, scale, aspectRatio } = options.size
  let bool = false
  const { realWidth, realHeight } = await computeImageSize(blob)
  // 1. 限定比例, 比例被限定时，不容许误差存在
  if (aspectRatio) {
    vaildateAspectRatio({ width, height, realWidth, realHeight, aspectRatio })
  // 2. 自由尺寸
  } else if (width === 0 && height === 0) {
    bool = true
  // 3. 限定宽高, 并处理相应的缩放和误差
  } else {
    handleSizeLimit({ width, height, error, scale, realHeight, realWidth })
  }
  return bool
}

// 计算图片实际尺寸
function computeImageSize (img:Blob): Promise<realImageSize> {
  const blob = URL.createObjectURL(img)
  const image = document.createElement('img')
  image.src = blob
  return new Promise(resolve => {
    image.addEventListener('load', () => {
      const realHeight = image.naturalHeight
      const realWidth = image.naturalWidth
      resolve({ realWidth, realHeight })
    })
  })
}

// 验证图片比例
function vaildateAspectRatio ({ realWidth, realHeight, width, height, aspectRatio }): boolean {
  const ratio = aspectRatio.split(':')
  let bool = false
  let cw = width
  let ch = height
  if (width > 0 && height > 0) {
    const w = realWidth / ratio[0]
    const h = realHeight / ratio[1]
    bool = w === Math.floor(w) && h === Math.floor(h) && w === h
  } else if (width > 0) {
    const w = width / ratio[0]
    const h = realHeight / ratio[1]
    bool = h === Math.floor(h) && w <= h
    cw = width
    ch = w * ratio[1]
  } else if (height > 0) {
    const h = height / ratio[1]
    const w = realWidth / ratio[0]
    bool = w === Math.floor(w) && w <= h
    cw = h * ratio[0]
    ch = height
  } else {
    // 如果比例出现错误，并给出建议尺寸
    const w = realWidth / ratio[0]
    const h = realHeight / ratio[1]
    bool = w === Math.floor(w) && h === Math.floor(h) && w === h
    cw = Math.floor(w) * ratio[0]
    ch = Math.floor(w) * ratio[1]
  }
  if (!bool) {
    const err = {
      status: 'error',
      message: `图片比例不符：建议尺寸${cw}×${ch}px`,
      code: 7,
      size: { width: cw, height: ch }
    }
    throw err
  }
  return bool
}

// 处理图片的尺寸限制
function handleSizeLimit ({ width, height, error, scale, realHeight, realWidth }): boolean {
  let bool = false
  const err = {
    status: 'error',
    code: 7,
    message: '',
    size: { width, height, error, scale }
  }
  // 1、无误差时，计算宽高比是否一致
  if (error === 0) {
    let r1 = 0
    let r2 = 0
    if (width > 0 && height > 0) {
      r1 = Math.floor(width / height * 100)
      r2 = Math.floor(realWidth / realHeight * 100)
    }
    // 1-a. 确保比例一致
    const bRatio = r1 === r2
    // 1-b. 确保尺寸在合理范围内
    let bScale = true
    if (scale === 1) {
      bScale = realWidth === width && realHeight === height
      if (width === 0 || height === 0) {
        bScale = realWidth === width || realHeight === height
      }
    } else if (scale < 1) {
      bScale = realWidth >= width * scale && realHeight >= height * scale
      if (width === 0) {
        bScale = realHeight >= height * scale && realHeight <= height
      }
      if (height === 0) {
        bScale = realWidth >= width * scale && realWidth <= width
      }
    } else {
      bScale = realWidth <= width * scale && realHeight <= height * scale
      if (width === 0) {
        bScale = realHeight <= height * scale && realHeight >= height
      }
      if (height === 0) {
        bScale = realWidth <= width * scale && realWidth >= width
      }
    }
    bool = bRatio && bScale
  } else {
    const params = { realWidth, realHeight, width, height, error }
    const bScale = vaildateError(params)
    let bwErr = true
    let bhErr = true
    let wError = error * 1
    let hError = error * 1
    // 当 error 为小于 1 的小数时，计算出等比的误差值
    if (error < 1) {
      wError = width * error
      hError = height * error
    }
    if (scale === 1) {
      bwErr = width > 0 ? Math.abs(realWidth - width) <= wError : true
      bhErr = height > 0 ? Math.abs(realHeight - height) <= hError : true
    } else if (scale > 1) {
      bwErr = width > 0 ? (realWidth >= width - wError) && (realWidth <= Math.floor(width * scale) + wError) : true
      bhErr = height > 0 ? (realHeight >= height - hError) && (realHeight <= Math.floor(height * scale) + hError) : true
    } else {
      bwErr = width > 0 ? (realWidth <= width + wError) && (realWidth >= Math.floor(width * scale) - wError) : true
      bhErr = height > 0 ? (realHeight <= height + hError) && (realHeight >= Math.floor(height * scale) - hError) : true
    }
    bool = bScale && (bwErr && bhErr)
  }
  if (!bool) {
    let message = `图片尺寸不符，建议尺寸：${width}×${height}px`
    if (width === 0) {
      message = `图片尺寸不符，图片建议高度：${height}px`
    }
    if (height === 0) {
      message = `图片尺寸不符，建议尺寸：${width}px`
    }
    err.message = message
    throw err
  }
  return bool
}

function vaildateError ({ realWidth, realHeight, width, height, error }) {
  let minScale = 0
  let maxScale = 0
  if (width > 0 && height > 0) {
    if (error < 1) {
      minScale = Math.floor((width - width * error) / (height + height * error) * 100)
      maxScale = Math.floor((width + width * error) / (height - height * error) * 100)
    } else {
      minScale = Math.floor((width - error) / (height + error) * 100)
      maxScale = Math.floor((width + error) / (height - error) * 100)
    }
  }
  const realScale = Math.floor(realWidth / realHeight * 100)
  let status = minScale <= realScale && realScale <= maxScale
  if (width === 0) {
    const mError = error < 1 ? height * error : error
    status = realHeight >= height - mError && realHeight <= height + mError
  }
  if (height === 0) {
    const mError = error < 1 ? width * error : error
    status = realWidth >= width - mError && realWidth <= width + mError
  }
  if (!status) {
    let message = `误差过大，建议尺寸：${width}×${height}px`
    if (width === 0) {
      message = `误差过大，图片建议高度：${height}px`
    }
    if (height === 0) {
      message = `误差过大，图片建议宽度：${width}px`
    }
    const err = {
      status: 'error',
      message,
      code: 8,
      size: { width, height, error }
    }
    throw err
  }
  return status
}

// 设置分片大小
function setPartSize (blob: Blob): number {
  const { size } = blob
  let num = 102400
  if (size > 512000 && size <= 5242880) {
    num = 307200
  } else if (size > 5242880) {
    num = 819200
  }
  return num
}

function getTypeOf (val: any): string {
  return (Object.prototype.toString.call(val).slice(8, -1)).toLowerCase()
}

function getExtName (name: string): string {
  let res = ''
  const i = name.lastIndexOf('.')
  if (i > -1) { res = name.slice(i + 1) }
  return res.toLowerCase()
}
