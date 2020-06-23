export default class Base {
  constructor (props) {
    this.multiple = props.multiple || false
  }
  /**
   * 返回数据的标准类型名称, 如 string, array, object, function 等等
   * @returns string
   * @param {any} val 要检验的数据
   */
  typeOf (val) {
    const type = Object.prototype.toString.call(val).slice(8, -1)
    return type.toLowerCase()
  }

  // 返回在内存中创建的 <input type="file" /> 对象
  createInput () {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    if (this.multiple) { fileInput.multiple = 'multiple' }
    return fileInput
  }
}