import Base from './base.js'
export default class Vaildate extends Base {
  async vaildateFiles (blobs) {
    for (let i = 0; i < blobs.length; i++) {
      // 1. 检查文件类型是否合法
      this.vaildateType(blobs[i])
      // 2. 检查文件大小是否合法
      this.vaildateLimit(blobs[i])
      // 3. 检查图片尺寸是否合法
      if (blobs[i].type.indexOf('image') === 0) {
        await this.vaildateImageSize(blobs[i])
      }
    }
  }

  /**
   * @description 检测文件类型是否合法
   * @param {blob} blob 要校验的文件
   * @returns boolean
   */
  vaildateType (blob) {}

  /**
   * @description 检测文件大小是否合法
   * @param {blob} blob 要校验的文件
   * @returns boolean
   */
  vaildateLimit (blob) {}

  /**
   * @description 检测图片尺寸是否合法
   * @param {blob} blob 要校验的文件
   * @returns boolean
   */
  vaildateImageSize (blob) {}
}
