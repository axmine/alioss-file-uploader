# alioss-file-uploader 【Ali-oss 文件 web 端直传插件]
## A plugin of upload file directly from webClient to ali-oss servers

### 特性
- 支持文件类型验证
- 支持文件大小验证
- 支持多文件分片上传
- 图片类文件支持图片尺寸验证，允许按比例上传对应文件, 支持误差值.
- sts临时授权上传，文件名由服务器派发，可有效控制文件重名导致被覆盖的问题。
- 微信浏览器下正常工作
- 微信小程序端 webview 组件内正常工作

### 内部工作步骤
1. 创建 \<input type="file"\> 文件选择器
2. 监听 change 事件
3. 执行文件校验（验证文件的类型，大小，尺寸）
4. 初始化 oss
5. 开始上传文件并触发回调, 实时返回上传状态及进度

## 使用方法
html
```html
<button onClick="upload">Select file</button>
```
js
```javascript
import Alioss from 'alioss-file-uploader'

function upload() {
  const oss = new Alioss()
  oss.upload(fetchSts, callBack)
}

```
# methods: upload(fetchSts, callBack, [option])

## fetchSts: { object | function }
1. 当 fetchSts 为 function 时, 请定义为异步函数，OSS 在初始化阶段会调用并将要上传的文件列表返回，fetchSts执行后请返回 { config: {}, files: [] }
2. 如果 fetchSts 为 object 时，请直接提供以下格式的数据

具体返回内容
```javascript
{
  // 后端使用 ali-oss 提供的sdk， 获取以下数据
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
回调示例
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