"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PiMysqlMock = exports.PiMysqlConnectionMock = exports.PiAction = void 0;
require("sqlstring");
const SqlString = require('sqlstring'), mysql = require('mysql');
class PiAction {
    constructor(_mock, type, data) {
        this._mock = _mock;
        this.type = type;
        this.data = data;
    }
    resolve(error, result, fields) {
        this.data.cb(error, result, fields);
        this._mock.removeAction(this);
    }
}
exports.PiAction = PiAction;
class PiMysqlConnectionMock {
    constructor(_mock) {
        this._mock = _mock;
    }
    beginTransaction(cb) {
        this._mock.addAction('beginTransaction', { cb });
    }
    commit(cb) {
        this._mock.addAction('commit', { cb });
    }
    rollback(cb) {
        this._mock.addAction('rollback', { cb });
    }
    query(sql, values, cb) {
        this._mock.addAction('query', { sql, values, cb });
    }
    end(cb) {
        this._mock.addAction('end', { cb });
    }
    escape(value) {
        return SqlString.escape(value, false, 'local');
    }
}
exports.PiMysqlConnectionMock = PiMysqlConnectionMock;
class PiMysqlMock {
    constructor() {
        this._actions = [];
    }
    begin() {
        this._origCreateConnection = mysql.createConnection;
        mysql.createConnection = () => new PiMysqlConnectionMock(this);
    }
    end() {
        mysql.createConnection = this._origCreateConnection;
    }
    addAction(type, query) {
        this._actions.push(new PiAction(this, type, query));
    }
    removeAction(action) {
        let index = this._actions.indexOf(action);
        this._actions.splice(index, 1);
    }
    expectOne(type, sql) {
        let re;
        if (type == 'query') {
            if (!sql)
                console.warn('expectOne finding the first query (any of them). Send "sql" parameter for specific search');
            else
                re = typeof sql == 'string' ? new RegExp(sql, 'i') : sql;
        }
        let action = this._actions.find(a => a.type == type && (!re || re.test(a.data.sql)));
        if (!action)
            throw new Error(`/${type == 'query' ? sql : type}/ action not found`);
        return action;
    }
}
exports.PiMysqlMock = PiMysqlMock;
//# sourceMappingURL=PiMysqlMock.js.map