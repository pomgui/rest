"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pirest_lib_1 = require("pirest-lib");
var PiDatabase = /** @class */ (function () {
    function PiDatabase() {
    }
    /**
     * Same as query(), but oriented to return one single record. If the record is not found it shall throw
     * an error 404
     * @param sql
     * @param params
     * @param options
     */
    PiDatabase.prototype.querySingle = function (sql, params, options) {
        return this.query(sql, params, options)
            .then(function (list) {
            if (!list.length)
                throw new pirest_lib_1.PiRestError('Not found', 404);
            if (list.length != 1)
                throw new pirest_lib_1.PiRestError('Too many rows', 406);
            return list[0];
        });
    };
    return PiDatabase;
}());
exports.PiDatabase = PiDatabase;
;
//# sourceMappingURL=PiDatabase.js.map