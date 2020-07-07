define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Options = exports.OptionsLimitUnit = void 0;
    var OptionsLimitUnit;
    (function (OptionsLimitUnit) {
        OptionsLimitUnit["KB"] = "kb";
        OptionsLimitUnit["MB"] = "mb";
        OptionsLimitUnit["GB"] = "gb";
        OptionsLimitUnit["TB"] = "tb";
    })(OptionsLimitUnit = exports.OptionsLimitUnit || (exports.OptionsLimitUnit = {}));
    // options 成员 DTO
    var Options = /** @class */ (function () {
        function Options() {
        }
        return Options;
    }());
    exports.Options = Options;
});
