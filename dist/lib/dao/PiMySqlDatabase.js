"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var mysql = require("mysql");
var PiDatabase_1 = require("./PiDatabase");
var pirest_lib_1 = require("pirest-lib");
var PiMySqlDatabase = /** @class */ (function (_super) {
    tslib_1.__extends(PiMySqlDatabase, _super);
    function PiMySqlDatabase(connectionUri) {
        var _this = _super.call(this) || this;
        _this._conn = mysql.createConnection(connectionUri);
        return _this;
    }
    PiMySqlDatabase.prototype.beginTransaction = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            return _this._conn.beginTransaction(function (err) { return err ? reject(err) : resolve(); });
        });
    };
    PiMySqlDatabase.prototype.commit = function () {
        var _this = this;
        console.debug('commit');
        return new Promise(function (resolve, reject) {
            return _this._conn.commit(function (err) { return err ? reject(err) : resolve(); });
        });
    };
    PiMySqlDatabase.prototype.rollback = function () {
        var _this = this;
        console.debug('rollback');
        return new Promise(function (resolve, reject) {
            return _this._conn.rollback(function () { return resolve(); });
        });
    };
    PiMySqlDatabase.prototype.query = function (sql, params, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var ignored = new Set((options.ignore || []).map(function (i) { return i.toLowerCase(); }));
        return new Promise(function (resolve, reject) {
            sql = _this._parseNamedParams(sql, params);
            console.debug('SQL> ', sql.replace(/\s+/g, ' '));
            // Execute query
            _this._conn.query(sql, [], function (err, results, fields) {
                if (err)
                    reject(new pirest_lib_1.PiRestError(err));
                else {
                    if (results[1] && "affectedRows" in results[1])
                        // work around when it's a CALL and not a SELECT
                        results = results[0];
                    var list = results.map
                        && results.map(function (r) { return db2json(r, options); });
                    resolve(list);
                }
            });
        });
        function db2json(record, options) {
            var result = {};
            for (var col in record) {
                if (ignored.has(col.toLowerCase()))
                    continue;
                result[column2camel(col, options)] = record[col];
            }
            return result;
        }
    };
    PiMySqlDatabase.prototype.insert = function (sql, params) {
        var _this = this;
        sql = this._parseNamedParams(sql, params);
        return new Promise(function (resolve, reject) {
            console.debug('SQL> ', sql.replace(/\s+/g, ' '));
            _this._conn.query(sql, params, function (err, results, fields) {
                if (err)
                    reject(new pirest_lib_1.PiRestError(err));
                else {
                    if (results.affectedRows == 1)
                        resolve(results.insertId);
                    else {
                        var ids = new Array(results.affectedRows).fill(0)
                            .map(function (dummy, i) { return results.insertId + i; });
                        resolve(ids);
                    }
                }
            });
        });
    };
    PiMySqlDatabase.prototype.update = function (sql, params) {
        var _this = this;
        sql = this._parseNamedParams(sql, params);
        return new Promise(function (resolve, reject) {
            console.debug('SQL> ', sql.replace(/\s+/g, ' '));
            _this._conn.query(sql, params, function (err, results, fields) {
                if (err)
                    reject(new pirest_lib_1.PiRestError(err));
                else
                    resolve(results.affectedRows);
            });
        });
    };
    PiMySqlDatabase.prototype.close = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            return _this._conn.end(function (err) { return err ? reject(err) : resolve(); });
        });
    };
    PiMySqlDatabase.prototype._parseNamedParams = function (sql, params) {
        var _this = this;
        sql = sql.trim();
        if (params) {
            sql = sql.replace(/:([a-z_][\w.]*)/gi, function (p, id) {
                var val = getValue(params, id);
                if (val === undefined) {
                    console.warn("WARN: SQL Parameter '" + p + "' not defined. Using null");
                    val = null;
                }
                return _this._conn.escape(val);
            });
        }
        return sql;
        function getValue(obj, prop) {
            var val = obj;
            for (var _i = 0, _a = prop.split('.'); _i < _a.length; _i++) {
                var p = _a[_i];
                val = val[p];
            }
            return val;
        }
    };
    return PiMySqlDatabase;
}(PiDatabase_1.PiDatabase));
exports.PiMySqlDatabase = PiMySqlDatabase;
;
function column2camel(col, options) {
    col = col.toLowerCase();
    return options.map && options.map[col] ||
        col.replace(/_(.)/g, function (g, g1) { return g1.toUpperCase(); });
}
//# sourceMappingURL=PiMySqlDatabase.js.map