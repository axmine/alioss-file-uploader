# Ali-oss 文件 web 端直传插件
### A plugin of upload file directly from webClient to ali-oss servers

## 使用方法
安装
```shell
npm install alioss-file-uploader -S
```
html
```html
<button onClick="upload">Select file</button>
```
js
```javascript
import { Alioss } from 'alioss-file-uploader'

function upload() {
  const oss = new Alioss()
  oss.upload(fetchSts, callBack)
}

```
### 特性
- 支持文件类型验证
- 支持文件大小验证
- 支持多文件同时上传
- 通过配置项，可支持图片进行尺寸验证，可限制图片宽高比, 支持宽高误差值.
- 微信浏览器下正常工作
- 微信小程序端 webview 组件内的html页面也可正常上传图片
- 建议sts临时授权上传，文件名由服务器派发，可有效控制文件重名导致被覆盖的问题。
- 实时的上传状态及进度反馈，减少用户的等待焦虑感

### 内部工作步骤
1. 创建 \<input type="file"\> 文件选择器
2. 监听 input 的 change 事件
3. 执行文件校验（验证文件的类型，大小，尺寸）
4. 初始化 oss
5. 开始上传文件并触发回调, 实时返回上传状态及进度

# methods: upload(sts, callBack, [option])

## sts: { object | function }
1. 当 sts 为 function 时, 请定义为异步函数，OSS 在初始化阶段会调用并将要上传的文件列表返回，sts执行后请返回 { config: {}, files: [] }
2. 如果 sts 为 object 时，请直接提供以下格式的数据

具体返回内容
```javascript
{
  // 建议 config 及 files 由后端提供， 提高安全性的同时，还能为前端分配上传文件的名称，有效避免因文件重名被覆盖的风险。
  // 后端请使用 ali-oss 提供的sdk， 获取以下数据
  config: {
    accessKeyId: '',
    accessKeySecret: '',
    endpoint: '',
    region: '',
    bucket: '',
    stsToken: ''
  },
  // 根据文件列数量，服务端生成待上传的文件名，仅需提供 "路径 + 文件名" 就行，无需后缀名
  files: [
    '/example/01',
    '/example/02'
  ]
}
```
fetchSts 示例
```javascript
// 获取sts参数，用于实例化 Alioss 内部的OSS
async function fetchSts(files) {
  const data = await getSts()
  const { config, files } = data
  return { config, files }
}
```

## callBack: {function}
回调示例, 上传过程及上传完成，callBack会被实时触发, 并返回上传状态，上传进度等信息。
status[string]: loading(上传中), complete(上传完成)， error(上传出现错误， 若上传出现错误，会返回相应的code, 最后更新的文档)
file[object]: 正在上传的文件，实时的上传进度0 - 100，文件名，存储在oss的路径等信息
list[array]: 所有正在上传和已完成的文件的实时信息，具体内容和file一致。
```javascript
function callBack({ status, file, list }) {
  console.log(status, file, list)
}
```

## [options]: {object}  // 默认参数如下
```javascript
{
  // 允许的上传格式 string | array
  accept: '',
  // 图片尺寸限制 object
  size: {
    width: 0, // number: 图片宽度，0表示不限
    height: 0, // number: 图片高度，0表示不限
    scale: 1, // number: 当 scale 为小于 1 的小数时， wi
    aspectRatio: '',
    error: 0
  },
  // 文件大小限制 object
  limit: {
    min: 0,
    max: 10,
    unit: 'mb'
  },
  // 是否强制将已上传的文件修改为 https 地址
  https: true,
  // 是否允许一次选择多个文件上传
  multiple: false
}
```
示例：
```javascript
// 例 01: 限制为只允许上传图片
{ accept: 'image' }
// 例 02: 限制为只允许上传视频
{ accept: 'video' }
// 例 03，限制为只允许上传 jpg, png, gif类型的文件
{ accept: ['jpg', 'png', 'gif'] }
// 例 04：文件大小限制在 100M 以内
{ limit: { max: 100, unit: 'MB' } }
// 例 05：文件大小限制在 10 - 100kb
{ limit: { min: 1, max: 10, unit: 'KB' } }
// 例 06：限制图片宽高为：20*40px 至 200*400px, 并保持长比例
{ size: { width: 200, height: 400, scale: 0.1 } }
// 例 07： 只允许 10:7 的图片上传, 注意，如果设置了aspectRatio, 则scale不再生效
{ size: { aspectRatio: '10:7' } }
// 例 08： 图片尺寸允许 10px 的误差
{ size: { width: 100, height: 200, error: 10 } }
// 例 09： 图片尺寸允许 10% 的误差
{ size: { width: 100, height: 200, error: 0.1 } }
// 例 10： 图片尺寸最小 100*200px, 最大300*600px, 并允许 5% 的误差
{ size: { width: 100, height: 200, scale: 3, error: 0.05 } }
```

## change log
1. 修复大量bug
2. callBack 增加错误代码
### classBack 返回数据格式如下：
```javascript
// 上传中：
{
  status: 'loading'
  file: {}, // 当前正在上传的文件的信息
  list: [] // 当前正在上传所有文件信息
}

// 上传成功
{
  status: 'complete',
  file: {}, // 当前正在上传的文件的信息
  list: [] // 当前正在上传所有文件信息
}

// 上传失败
{
  status: 'error',
  message: '具体错误信息',
  code: 1 // 错误代码
  // ...  根据不同的错误代码返回的其他数据。
}
// 错误代码具体含义如下：
// 0: '文件类型不符合要求，请重新选择',
// 1: '该文件似乎是一个空文件，暂不支持空文件上传',
// 2: '文件太大，应介于最小值与最大值之间',
// 3: '文件太大，不得大于最大值',
// 4: '文件太小，应介于最小值与最大值之间',
// 5: '文件太小，不得小于最小值',
// 6: '此错误代码暂未定义'
// 7: '图片尺寸不符',
// 8: '图片误差过大',
// 9: '文件上传失败'
```