"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PiDatabase_1 = require("./PiDatabase");
var PiNoopDatabase = /** @class */ (function (_super) {
    tslib_1.__extends(PiNoopDatabase, _super);
    function PiNoopDatabase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PiNoopDatabase.prototype.beginTransaction = function () { return Promise.resolve(); };
    PiNoopDatabase.prototype.commit = function () { return Promise.resolve(); };
    PiNoopDatabase.prototype.rollback = function () { return Promise.resolve(); };
    PiNoopDatabase.prototype.query = function (sql, params, options) { return Promise.resolve(); };
    PiNoopDatabase.prototype.insert = function (sql, params) { return Promise.resolve(1); };
    PiNoopDatabase.prototype.update = function (sql, params) { return Promise.resolve(1); };
    PiNoopDatabase.prototype.close = function () { return Promise.resolve(); };
    return PiNoopDatabase;
}(PiDatabase_1.PiDatabase));
exports.PiNoopDatabase = PiNoopDatabase;
;
//# sourceMappingURL=PiNoopDatabase.js.map