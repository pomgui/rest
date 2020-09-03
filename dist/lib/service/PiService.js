"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pirest_lib_1 = require("pirest-lib");
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
        let orig = descriptor.value;
        let operation = (req, res) => {
            let db = (_dbFactoryFn && options.database) ? _dbFactoryFn() : null;
            let result;
            let desc = options.descriptor && (options.descriptor.o || (options.descriptor.o = new pirest_lib_1.PiTypeDescriptor(options.descriptor)));
            return Promise.resolve()
                .then(() => db && db.beginTransaction())
                .then(() => orig.call(target, normalizeQueryParams(req, desc), { db, req, res }))
                .then(r => result = r)
                .then(() => db && db.commit())
                .then(() => options.customSend || res.send(result))
                .catch(error => options.errorHandler({ db, req, res, error }))
                .finally(() => db && db.close())
                .catch(error => options.errorHandler({ db: null, req, res, error }));
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
        let params = {
            path: Object.assign({}, req.params),
            query: Object.assign({}, req.query),
            headers: Object.assign({}, req.headers),
            body: Object.assign({}, req.body)
        };
        if (desc)
            desc.cast(params);
        let ret = Object.assign({}, params.path, params.query, params.body);
        if (desc)
            // Only the defined headers in the descriptor
            Object.keys(params.headers).filter(h => desc.has(h)).forEach(h => ret[h] = params.headers[h]);
        else
            Object.assign(ret, params.headers);
        return ret;
    }
    function plain(err) {
        if (Array.isArray(err) || typeof err != 'object')
            return err;
        let plainObj = {};
        if (err.message)
            plainObj.message = err.message;
        if (err.data)
            plainObj.data = err.data;
        return plainObj;
    }
}
function PiService(config) {
    config.services.forEach(s => new s()); // Create an instance, just to access to the decorators
    _dbFactoryFn = config.dbFactoryFn;
    return _router;
}
exports.PiService = PiService;
//# sourceMappingURL=PiService.js.map