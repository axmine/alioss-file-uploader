var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "ali-oss"], function (require, exports, OSS) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createUploader = exports.createInput = exports.doVaildate = exports.formatAccept = exports.formatLimit = exports.formatSize = void 0;
    var lists = [];
    // 格式化 options.size 的值
    function formatSize(size) {
        var s = Object.assign({ width: 0, height: 0, scale: 1, error: 0, aspectRatio: '' }, size);
        var _a = s.height, height = _a === void 0 ? 0 : _a, _b = s.width, width = _b === void 0 ? 0 : _b, _c = s.scale, scale = _c === void 0 ? 1 : _c, _d = s.error, error = _d === void 0 ? 0 : _d, _e = s.aspectRatio, aspectRatio = _e === void 0 ? '' : _e;
        if (height < 0 || width < 0) {
            throw new Error('height or width is a positive integer or zero');
        }
        if (scale < 0) {
            throw new Error('scale is a positive integer or zero');
        }
        if (error < 0) {
            throw new Error('error is positive integer or  0 < float < 1 or 0, default value is 0');
        }
        if (aspectRatio !== '') {
            var ratio = aspectRatio.split(':');
            var r0 = parseInt(ratio[0], 10);
            var r1 = parseInt(ratio[1], 10);
            if (!(/\d+:\d+/.test(aspectRatio))) {
                throw new Error('aspectRatio\'s value is a string, like this: \'16:9\'');
            }
            else if (height > 0 && width > 0) {
                var w = width / r0;
                var h = height / r1;
                if (w !== Math.floor(w) || h !== Math.floor(h) || w !== h) {
                    throw new Error('it\'s can\'t complete calculation by aspectratio、with、height');
                }
            }
            else if (height > 0) {
                var h = height / r1;
                if (h !== Math.floor(h)) {
                    throw new Error('aspectratio or height is not a suitable number');
                }
            }
            else if (width > 0) {
                var w = width / r0;
                if (w !== Math.floor(w)) {
                    throw new Error('aspectratio or width is not a suitable number');
                }
            }
            // 校组定义的比例是否合理
        }
        return {
            height: height,
            width: width,
            scale: Math.floor(scale * 100) / 100,
            error: error < 1 ? error : Math.floor(error),
            aspectRatio: aspectRatio
        };
    }
    exports.formatSize = formatSize;
    // 格式化 options.limit 的值
    function formatLimit(val) {
        var _a = val.min, min = _a === void 0 ? 0 : _a, _b = val.max, max = _b === void 0 ? 0 : _b, _c = val.unit, unit = _c === void 0 ? 'mb' : _c;
        if (getTypeOf(min) !== 'number' || getTypeOf(max) !== 'number') {
            throw new Error('min or max must be number');
        }
        if (min < 0 || max < 0) {
            throw new Error('min or max must be a positive integer or zero');
        }
        if (min > max && max !== 0) {
            throw new Error('if max > 0, then: min must less than max or equal max');
        }
        // const aUnit: Array<string> =
        if (!['kb', 'mb', 'gb', 'tb'].includes(unit.toLowerCase())) {
            throw new Error('limit.unit must be：\'kb\'|\'mb\'|\'gb\'|\'tb\'');
        }
        var units = { kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 };
        return {
            min: Math.floor(min * units[unit.toLowerCase()]),
            max: Math.floor(max * units[unit.toLowerCase()]),
            oMin: min,
            oMax: max,
            oUnit: unit.toUpperCase() // 传入的原始单位
        };
    }
    exports.formatLimit = formatLimit;
    // 格式化 options.accept 的值
    function formatAccept(val) {
        var accept = val;
        if (Array.isArray(accept)) {
            for (var i = 0; i < accept.length; i++) {
                accept.splice(i, 1, accept[i].toLowerCase());
                accept[i].indexOf('.') === 0 && accept.splice(i, 1, accept[i].slice(1));
            }
            return accept;
        }
        if (typeof accept === 'string') {
            accept = accept.toLowerCase();
            if (accept.indexOf('.') === 0) {
                accept = accept.slice(1);
            }
            return accept;
        }
    }
    exports.formatAccept = formatAccept;
    // 执行检查
    function doVaildate(blobs, options) {
        return __awaiter(this, void 0, void 0, function () {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < blobs.length)) return [3 /*break*/, 4];
                        // 1、校验文件类型是否符合
                        vaildateFileType(blobs[i], options);
                        // 2、校验文件大小是否符合
                        vaildateFileLimit(blobs[i], options);
                        if (!(blobs[i].type.indexOf('image') === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, vaildateImageSize(blobs[i], options)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    exports.doVaildate = doVaildate;
    // 创建 <input type="file" />对象
    function createInput(options) {
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        if (options.multiple) {
            fileInput.multiple = true;
        }
        return fileInput;
    }
    exports.createInput = createInput;
    function createUploader(blobs, sts, callBack, options) {
        return __awaiter(this, void 0, void 0, function () {
            var list, _a, config, files, alioss;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        list = createList(blobs);
                        return [4 /*yield*/, getSts(sts, list)
                            // 3. 初始化OSS
                        ];
                    case 1:
                        _a = _b.sent(), config = _a.config, files = _a.files;
                        alioss = new OSS(config);
                        // 4. 开始上传列表
                        lists.length = 0;
                        list.forEach(function (e, i) {
                            e.upName = files[i] + "." + e.extName;
                            lists.push({
                                index: i,
                                progress: 0,
                                size: e.size,
                                file: e.orgName,
                                name: e.upName,
                                url: '',
                                checkpoint: null,
                                complete: false
                            });
                            multipartUpload(e, callBack, alioss, options);
                        });
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.createUploader = createUploader;
    // 生成上传列表
    function createList(blobs) {
        var list = [];
        Object.keys(blobs).forEach(function (i) {
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
            });
        });
        return list;
    }
    // 分片上传方法
    function multipartUpload(e, fn, alioss, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, name, res, url, i, file, err;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, alioss.multipartUpload(e.upName, e.blob, {
                            partSize: setPartSize(e.blob),
                            progress: function (progress, checkpoint) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        lists[e.index].progress = Math.floor(progress * 100);
                                        lists[e.index].checkpoint = checkpoint;
                                        fn && fn({
                                            status: 'loading',
                                            file: lists[e.index],
                                            list: lists
                                        });
                                        return [2 /*return*/];
                                    });
                                });
                            }
                        })
                        // 处理结果
                    ];
                    case 1:
                        _a = _b.sent(), name = _a.name, res = _a.res;
                        // 处理结果
                        if (name && res.status * 1 === 200) {
                            url = res.requestUrls[0];
                            i = url.indexOf(name);
                            file = url.slice(0, i) + name;
                            if (options.https && file.indexOf('https:') !== 0) {
                                file = 'https:' + url.slice(5);
                            }
                            lists[e.index].url = file;
                            lists[e.index].complete = true;
                            lists.map(function (ele) {
                                var i = ele.url.indexOf(ele.name);
                                ele.url = ele.url.slice(0, i) + ele.name;
                            });
                            fn && fn({
                                status: 'complete',
                                file: lists[e.index],
                                list: lists
                            });
                            // 标记为已完成
                            // 检查是否全部完成了
                            // this.files.forEach(e => e.complete)
                            //   fileInput.removeEventListener('change')
                            // }
                        }
                        else {
                            err = {
                                status: 'error',
                                code: 9,
                                file: lists[e.index],
                                list: lists,
                                message: '文件上传失败，请重试'
                            };
                            throw err;
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    function getSts(sts, list) {
        return __awaiter(this, void 0, void 0, function () {
            var config, files, _a, blobs_1, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        files = [];
                        _a = getTypeOf(sts);
                        switch (_a) {
                            case 'function': return [3 /*break*/, 1];
                            case 'object': return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 4];
                    case 1:
                        blobs_1 = [];
                        list.forEach(function (e) { return blobs_1.push({ size: e.size, name: e.orgName }); });
                        return [4 /*yield*/, sts(blobs_1)];
                    case 2:
                        res = _b.sent();
                        if (res) {
                            config = res.config;
                            files = res.files;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        config = sts.config;
                        files = sts.files;
                        return [3 /*break*/, 4];
                    case 4:
                        if (!config.stsToken || files.length < 1) {
                            throw new Error('STS参数错误，请传入正确的OSS参数');
                        }
                        return [2 /*return*/, { config: config, files: files }];
                }
            });
        });
    }
    // 验证文件类型
    function vaildateFileType(blob, options) {
        var bool = options.accept === '';
        if (options.accept !== '') {
            var type = blob.type, name_1 = blob.name;
            if (Array.isArray(options.accept)) {
                bool = options.accept.some(function (e) { return e === getExtName(name_1); });
            }
            if (typeof options.accept === 'string') {
                bool = type.indexOf(options.accept) === 0;
            }
            // 抛出错误
            if (!bool) {
                var err = {
                    status: 'error',
                    code: 0,
                    message: '文件类型不符合要求, 请重新选择',
                    file: name_1
                };
                throw err;
            }
        }
        return bool;
    }
    // 验证文件大小
    function vaildateFileLimit(blob, options) {
        var _a = options.limit, min = _a.min, max = _a.max, oMin = _a.oMin, oMax = _a.oMax, oUnit = _a.oUnit;
        var bool = true;
        if (max > 0) {
            var name_2 = blob.name, size = blob.size;
            var err = {
                status: 'error',
                code: 2,
                file: name_2,
                message: '',
                limit: {
                    min: oMin,
                    max: oMax,
                    unit: oUnit
                }
            };
            // 禁止上传空文件
            if (size < 1) {
                bool = false;
                err.message = '该文件似乎是一个空文件，不支持上传空文件';
                err.code = 1;
            }
            else if (size > max) {
                bool = false;
                var msg = oMin > 0 ? "\u5E94\u4ECB\u4E8E " + oMin + "-" + oMax + oUnit + " \u4E4B\u95F4" : "\u4E0D\u5F97\u5927\u4E8E " + oMax + oUnit;
                err.code = oMin > 0 ? 2 : 3;
                err.message = "\u6587\u4EF6\u592A\u5927\uFF0C" + msg;
            }
            else if (size < min) {
                bool = false;
                err.message = "\u6587\u4EF6\u592A\u5C0F\uFF0C\u5E94\u4ECB\u4E8E " + oMin + "-" + oMax + oUnit + " \u4E4B\u95F4";
                err.code = oMax > 0 ? 4 : 5;
            }
            if (!bool) {
                throw err;
            }
        }
        return bool;
    }
    // 验证图片尺寸
    function vaildateImageSize(blob, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, width, height, error, scale, aspectRatio, bool, _b, realWidth, realHeight;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.size, width = _a.width, height = _a.height, error = _a.error, scale = _a.scale, aspectRatio = _a.aspectRatio;
                        bool = false;
                        return [4 /*yield*/, computeImageSize(blob)
                            // 1. 限定比例, 比例被限定时，不容许误差存在
                        ];
                    case 1:
                        _b = _c.sent(), realWidth = _b.realWidth, realHeight = _b.realHeight;
                        // 1. 限定比例, 比例被限定时，不容许误差存在
                        if (aspectRatio) {
                            vaildateAspectRatio({ width: width, height: height, realWidth: realWidth, realHeight: realHeight, aspectRatio: aspectRatio });
                            // 2. 自由尺寸
                        }
                        else if (width === 0 && height === 0) {
                            bool = true;
                            // 3. 限定宽高, 并处理相应的缩放和误差
                        }
                        else {
                            handleSizeLimit({ width: width, height: height, error: error, scale: scale, realHeight: realHeight, realWidth: realWidth });
                        }
                        return [2 /*return*/, bool];
                }
            });
        });
    }
    // 计算图片实际尺寸
    function computeImageSize(img) {
        var blob = URL.createObjectURL(img);
        var image = document.createElement('img');
        image.src = blob;
        return new Promise(function (resolve) {
            image.addEventListener('load', function () {
                var realHeight = image.naturalHeight;
                var realWidth = image.naturalWidth;
                resolve({ realWidth: realWidth, realHeight: realHeight });
            });
        });
    }
    // 验证图片比例
    function vaildateAspectRatio(_a) {
        var realWidth = _a.realWidth, realHeight = _a.realHeight, width = _a.width, height = _a.height, aspectRatio = _a.aspectRatio;
        var ratio = aspectRatio.split(':');
        var bool = false;
        var cw = width;
        var ch = height;
        if (width > 0 && height > 0) {
            var w = realWidth / ratio[0];
            var h = realHeight / ratio[1];
            bool = w === Math.floor(w) && h === Math.floor(h) && w === h;
        }
        else if (width > 0) {
            var w = width / ratio[0];
            var h = realHeight / ratio[1];
            bool = h === Math.floor(h) && w <= h;
            cw = width;
            ch = w * ratio[1];
        }
        else if (height > 0) {
            var h = height / ratio[1];
            var w = realWidth / ratio[0];
            bool = w === Math.floor(w) && w <= h;
            cw = h * ratio[0];
            ch = height;
        }
        else {
            // 如果比例出现错误，并给出建议尺寸
            var w = realWidth / ratio[0];
            var h = realHeight / ratio[1];
            bool = w === Math.floor(w) && h === Math.floor(h) && w === h;
            cw = Math.floor(w) * ratio[0];
            ch = Math.floor(w) * ratio[1];
        }
        if (!bool) {
            var err = {
                status: 'error',
                message: "\u56FE\u7247\u6BD4\u4F8B\u4E0D\u7B26\uFF1A\u5EFA\u8BAE\u5C3A\u5BF8" + cw + "\u00D7" + ch + "px",
                code: 7,
                size: { width: cw, height: ch }
            };
            throw err;
        }
        return bool;
    }
    // 处理图片的尺寸限制
    function handleSizeLimit(_a) {
        var width = _a.width, height = _a.height, error = _a.error, scale = _a.scale, realHeight = _a.realHeight, realWidth = _a.realWidth;
        var bool = false;
        var err = {
            status: 'error',
            code: 7,
            message: '',
            size: { width: width, height: height, error: error, scale: scale }
        };
        // 1、无误差时，计算宽高比是否一致
        if (error === 0) {
            var r1 = 0;
            var r2 = 0;
            if (width > 0 && height > 0) {
                r1 = Math.floor(width / height * 100);
                r2 = Math.floor(realWidth / realHeight * 100);
            }
            // 1-a. 确保比例一致
            var bRatio = r1 === r2;
            // 1-b. 确保尺寸在合理范围内
            var bScale = true;
            if (scale === 1) {
                bScale = realWidth === width && realHeight === height;
                if (width === 0 || height === 0) {
                    bScale = realWidth === width || realHeight === height;
                }
            }
            else if (scale < 1) {
                bScale = realWidth >= width * scale && realHeight >= height * scale;
                if (width === 0) {
                    bScale = realHeight >= height * scale && realHeight <= height;
                }
                if (height === 0) {
                    bScale = realWidth >= width * scale && realWidth <= width;
                }
            }
            else {
                bScale = realWidth <= width * scale && realHeight <= height * scale;
                if (width === 0) {
                    bScale = realHeight <= height * scale && realHeight >= height;
                }
                if (height === 0) {
                    bScale = realWidth <= width * scale && realWidth >= width;
                }
            }
            bool = bRatio && bScale;
        }
        else {
            var params = { realWidth: realWidth, realHeight: realHeight, width: width, height: height, error: error };
            var bScale = vaildateError(params);
            var bwErr = true;
            var bhErr = true;
            var wError = error * 1;
            var hError = error * 1;
            // 当 error 为小于 1 的小数时，计算出等比的误差值
            if (error < 1) {
                wError = width * error;
                hError = height * error;
            }
            if (scale === 1) {
                bwErr = width > 0 ? Math.abs(realWidth - width) <= wError : true;
                bhErr = height > 0 ? Math.abs(realHeight - height) <= hError : true;
            }
            else if (scale > 1) {
                bwErr = width > 0 ? (realWidth >= width - wError) && (realWidth <= Math.floor(width * scale) + wError) : true;
                bhErr = height > 0 ? (realHeight >= height - hError) && (realHeight <= Math.floor(height * scale) + hError) : true;
            }
            else {
                bwErr = width > 0 ? (realWidth <= width + wError) && (realWidth >= Math.floor(width * scale) - wError) : true;
                bhErr = height > 0 ? (realHeight <= height + hError) && (realHeight >= Math.floor(height * scale) - hError) : true;
            }
            bool = bScale && (bwErr && bhErr);
        }
        if (!bool) {
            var message = "\u56FE\u7247\u5C3A\u5BF8\u4E0D\u7B26\uFF0C\u5EFA\u8BAE\u5C3A\u5BF8\uFF1A" + width + "\u00D7" + height + "px";
            if (width === 0) {
                message = "\u56FE\u7247\u5C3A\u5BF8\u4E0D\u7B26\uFF0C\u56FE\u7247\u5EFA\u8BAE\u9AD8\u5EA6\uFF1A" + height + "px";
            }
            if (height === 0) {
                message = "\u56FE\u7247\u5C3A\u5BF8\u4E0D\u7B26\uFF0C\u5EFA\u8BAE\u5C3A\u5BF8\uFF1A" + width + "px";
            }
            err.message = message;
            throw err;
        }
        return bool;
    }
    function vaildateError(_a) {
        var realWidth = _a.realWidth, realHeight = _a.realHeight, width = _a.width, height = _a.height, error = _a.error;
        var minScale = 0;
        var maxScale = 0;
        if (width > 0 && height > 0) {
            if (error < 1) {
                minScale = Math.floor((width - width * error) / (height + height * error) * 100);
                maxScale = Math.floor((width + width * error) / (height - height * error) * 100);
            }
            else {
                minScale = Math.floor((width - error) / (height + error) * 100);
                maxScale = Math.floor((width + error) / (height - error) * 100);
            }
        }
        var realScale = Math.floor(realWidth / realHeight * 100);
        var status = minScale <= realScale && realScale <= maxScale;
        if (width === 0) {
            var mError = error < 1 ? height * error : error;
            status = realHeight >= height - mError && realHeight <= height + mError;
        }
        if (height === 0) {
            var mError = error < 1 ? width * error : error;
            status = realWidth >= width - mError && realWidth <= width + mError;
        }
        if (!status) {
            var message = "\u8BEF\u5DEE\u8FC7\u5927\uFF0C\u5EFA\u8BAE\u5C3A\u5BF8\uFF1A" + width + "\u00D7" + height + "px";
            if (width === 0) {
                message = "\u8BEF\u5DEE\u8FC7\u5927\uFF0C\u56FE\u7247\u5EFA\u8BAE\u9AD8\u5EA6\uFF1A" + height + "px";
            }
            if (height === 0) {
                message = "\u8BEF\u5DEE\u8FC7\u5927\uFF0C\u56FE\u7247\u5EFA\u8BAE\u5BBD\u5EA6\uFF1A" + width + "px";
            }
            var err = {
                status: 'error',
                message: message,
                code: 8,
                size: { width: width, height: height, error: error }
            };
            throw err;
        }
        return status;
    }
    // 设置分片大小
    function setPartSize(blob) {
        var size = blob.size;
        var num = 102400;
        if (size > 512000 && size <= 5242880) {
            num = 307200;
        }
        else if (size > 5242880) {
            num = 819200;
        }
        return num;
    }
    function getTypeOf(val) {
        return (Object.prototype.toString.call(val).slice(8, -1)).toLowerCase();
    }
    function getExtName(name) {
        var res = '';
        var i = name.lastIndexOf('.');
        if (i > -1) {
            res = name.slice(i + 1);
        }
        return res.toLowerCase();
    }
});
