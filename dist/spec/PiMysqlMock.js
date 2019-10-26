"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("sqlstring");
var SqlString = require('sqlstring'), mysql = require('mysql');
var PiAction = /** @class */ (function () {
    function PiAction(_mock, type, data) {
        this._mock = _mock;
        this.type = type;
        this.data = data;
    }
    PiAction.prototype.resolve = function (error, result, fields) {
        this.data.cb(error, result, fields);
        this._mock.removeAction(this);
    };
    return PiAction;
}());
exports.PiAction = PiAction;
var PiMysqlConnectionMock = /** @class */ (function () {
    function PiMysqlConnectionMock(_mock) {
        this._mock = _mock;
    }
    PiMysqlConnectionMock.prototype.beginTransaction = function (cb) {
        this._mock.addAction('beginTransaction', { cb: cb });
    };
    PiMysqlConnectionMock.prototype.commit = function (cb) {
        this._mock.addAction('commit', { cb: cb });
    };
    PiMysqlConnectionMock.prototype.rollback = function (cb) {
        this._mock.addAction('rollback', { cb: cb });
    };
    PiMysqlConnectionMock.prototype.query = function (sql, values, cb) {
        this._mock.addAction('query', { sql: sql, values: values, cb: cb });
    };
    PiMysqlConnectionMock.prototype.end = function (cb) {
        this._mock.addAction('end', { cb: cb });
    };
    PiMysqlConnectionMock.prototype.escape = function (value) {
        return SqlString.escape(value, false, 'local');
    };
    return PiMysqlConnectionMock;
}());
exports.PiMysqlConnectionMock = PiMysqlConnectionMock;
var PiMysqlMock = /** @class */ (function () {
    function PiMysqlMock() {
        this._actions = [];
    }
    PiMysqlMock.prototype.begin = function () {
        var _this = this;
        this._origCreateConnection = mysql.createConnection;
        mysql.createConnection = function () { return new PiMysqlConnectionMock(_this); };
    };
    PiMysqlMock.prototype.end = function () {
        mysql.createConnection = this._origCreateConnection;
    };
    PiMysqlMock.prototype.addAction = function (type, query) {
        this._actions.push(new PiAction(this, type, query));
    };
    PiMysqlMock.prototype.removeAction = function (action) {
        var index = this._actions.indexOf(action);
        this._actions.splice(index, 1);
    };
    PiMysqlMock.prototype.expectOne = function (type, sql) {
        var re;
        if (type == 'query') {
            if (!sql)
                console.warn('expectOne finding the first query (any of them). Send "sql" parameter for specific search');
            else
                re = typeof sql == 'string' ? new RegExp(sql, 'i') : sql;
        }
        var action = this._actions.find(function (a) { return a.type == type && (!re || re.test(a.data.sql)); });
        if (!action)
            throw new Error("/" + (type == 'query' ? sql : type) + "/ action not found");
        return action;
    };
    return PiMysqlMock;
}());
exports.PiMysqlMock = PiMysqlMock;
//# sourceMappingURL=PiMysqlMock.js.map