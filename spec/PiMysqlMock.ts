import 'sqlstring';
const
    SqlString = require('sqlstring'),
    mysql = require('mysql');

export type PiQueryCallback = { (error: any, result: any, fields: any): void };
export type PiQueryParams = { sql?: string, values?: any[], cb: PiQueryCallback };
export type PiActionType = 'query' | 'beginTransaction' | 'commit' | 'rollback' | 'end';

export class PiAction {
    constructor(
        private _mock: PiMysqlMock,
        public type: PiActionType,
        public data: PiQueryParams
    ) { }

    resolve(error?: any, result?: any, fields?: any): void {
        this.data!.cb(error, result, fields);
        this._mock.removeAction(this);
    }
}

export class PiMysqlConnectionMock {

    constructor(private _mock: PiMysqlMock) { }

    beginTransaction(cb: { (error: any): void }) {
        this._mock.addAction('beginTransaction', { cb });
    }
    commit(cb: { (error: any): void }) {
        this._mock.addAction('commit', { cb });
    }
    rollback(cb: { (): void }) {
        this._mock.addAction('rollback', { cb });
    }
    query(sql: string, values: any[], cb: PiQueryCallback): void {
        this._mock.addAction('query', { sql, values, cb });
    }
    end(cb: { (error: any): void }) {
        this._mock.addAction('end', { cb });
    }
    escape(value: any) {
        return SqlString.escape(value, false, 'local');
    }
}


export class PiMysqlMock {
    private _actions: PiAction[] = [];
    private _origCreateConnection: any;

    begin() {
        this._origCreateConnection = mysql.createConnection;
        mysql.createConnection = () => new PiMysqlConnectionMock(this);
    }
    end() {
        mysql.createConnection = this._origCreateConnection;
    }
    addAction(type: PiActionType, query: PiQueryParams) {
        this._actions.push(new PiAction(this, type, query));
    }
    removeAction(action: PiAction): void {
        let index = this._actions.indexOf(action);
        this._actions.splice(index, 1);
    }
    expectOne(type: PiActionType, sql?: string | RegExp): PiAction {
        let re: RegExp;
        if (type == 'query') {
            if (!sql)
                console.warn('expectOne finding the first query (any of them). Send "sql" parameter for specific search')
            else
                re = typeof sql == 'string' ? new RegExp(sql, 'i') : sql;
        }
        let action = this._actions.find(a => a.type == type && (!re || re.test(a.data.sql!)));
        if (!action)
            throw new Error(`/${type == 'query' ? sql : type}/ action not found`);
        return action;
    }
}