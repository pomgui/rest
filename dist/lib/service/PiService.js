"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var _router = express_1.Router(), _dbFactoryFn;
function PiGET(path, options) { return decorator(path, _router.get, options); }
exports.PiGET = PiGET;
function PiPOST(path, options) { return decorator(path, _router.post, options); }
exports.PiPOST = PiPOST;
function PiPUT(path, options) { return decorator(path, _router.put, options); }
exports.PiPUT = PiPUT;
function PiPATCH(path, options) { return decorator(path, _router.patch, options); }
exports.PiPATCH = PiPATCH;
function PiDELETE(path, options) { return decorator(path, _router.delete, options); }
exports.PiDELETE = PiDELETE;
function decorator(path, defineRoute, options) {
    options = Object.assign({ database: true, errorHandler: defaultErrorHandler }, options);
    return function (target, propertyKey, descriptor) {
        var orig = descriptor.value;
        var operation = function (req, res) {
            var db = (_dbFactoryFn && options.database) ? _dbFactoryFn() : null;
            var result;
            return Promise.resolve()
                .then(function () { return db && db.beginTransaction(); })
                .then(function () { return orig.call(target, normalizeQueryParams(req, options.descriptor), { db: db, req: req, res: res }); })
                .then(function (r) { return result = r; })
                .then(function () { return db && db.commit(); })
                .then(function () { return options.customSend || res.send(result); })
                .catch(function (error) { return options.errorHandler({ db: db, req: req, res: res, error: error }); })
                .finally(function () { return db && db.close(); })
                .catch(function (error) { return options.errorHandler({ db: null, req: req, res: res, error: error }); });
        };
        defineRoute.call(_router, path, operation);
    };
    function defaultErrorHandler(options) {
        options.res.set('Content-Type', 'application/json; charset=utf-8')
            .status(options.error.status || 500)
            .send(plain(options.error));
        // console.error('PiService catch: ', options.error);
        return options.db ? options.db.rollback() : Promise.resolve();
    }
    function normalizeQueryParams(req, desc) {
        var params = {
            path: Object.assign({}, req.params),
            query: Object.assign({}, req.query),
            headers: Object.assign({}, req.headers),
            body: Object.assign({}, req.body)
        };
        if (desc)
            desc.cast(params);
        var ret = Object.assign({}, params.path, params.query, params.body);
        if (desc)
            // Only the defined headers in the descriptor
            Object.keys(params.headers).filter(function (h) { return desc.has(h); }).forEach(function (h) { return ret[h] = params.headers[h]; });
        else
            Object.assign(ret, params.headers);
        return ret;
    }
    function plain(err) {
        if (Array.isArray(err) || typeof err != 'object')
            return err;
        var plainObj = {};
        if (err.message)
            plainObj.message = err.message;
        if (err.data)
            plainObj.data = err.data;
        return plainObj;
    }
}
function PiService(config) {
    config.services.forEach(function (s) { return new s(); }); // Create an instance, just to access to the decorators
    _dbFactoryFn = config.dbFactoryFn;
    return _router;
}
exports.PiService = PiService;
//# sourceMappingURL=PiService.js.map