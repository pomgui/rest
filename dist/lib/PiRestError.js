"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var piservices_common_1 = require("piservices-common");
var PiRestError = /** @class */ (function (_super) {
    tslib_1.__extends(PiRestError, _super);
    function PiRestError(message, status, data) {
        if (status === void 0) { status = 500; }
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.status = status;
        _this.data = data;
        return _this;
    }
    return PiRestError;
}(piservices_common_1.PiError));
exports.PiRestError = PiRestError;
//# sourceMappingURL=PiRestError.js.map