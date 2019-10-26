import * as mysql from "mysql";
import { PiDatabase, Options } from "./PiDatabase";
import { PiRestError } from "piservices-common";

export class PiMySqlDatabase extends PiDatabase {
    private _conn: mysql.Connection;

    constructor(connectionUri: string | mysql.ConnectionConfig) {
        super();
        this._conn = mysql.createConnection(connectionUri);
    }

    beginTransaction(): Promise<void> {
        return new Promise((resolve, reject) =>
            this._conn.beginTransaction(err => err ? reject(err) : resolve())
        )
    }

    commit(): Promise<void> {
        console.debug('commit');
        return new Promise((resolve, reject) =>
            this._conn.commit(err => err ? reject(err) : resolve())
        )
    }

    rollback(): Promise<void> {
        console.debug('rollback');
        return new Promise((resolve, reject) =>
            this._conn.rollback(() => resolve())
        )
    }

    query(sql: string, params: object, options: Options = {}): Promise<any> {
        let ignored = new Set((options.ignore || []).map(i => i.toLowerCase()));
        return new Promise<any[]>((resolve, reject) => {
            sql = this._parseNamedParams(sql, params);
            console.debug('SQL> ', sql.replace(/\s+/g, ' '));
            // Execute query
            this._conn.query(sql, [], (err: any, results: any, fields: any) => {
                if (err)
                    reject(new PiRestError(err));
                else {
                    if (results[1] && "affectedRows" in results[1])
                        // work around when it's a CALL and not a SELECT
                        results = results[0];
                    let list = results.map
                        && results.map((r: any) => db2json(r, options));
                    resolve(list);
                }
            });
        });

        function db2json(record: any, options: Options) {
            let result: any = {};
            for (let col in record) {
                if (ignored.has(col.toLowerCase()))
                    continue;
                result[column2camel(col, options)] = record[col];
            }
            return result;
        }
    }

    insert(sql: string, params?: any): Promise<any | any[]> {
        sql = this._parseNamedParams(sql, params);
        return new Promise((resolve, reject) => {
            console.debug('SQL> ', sql.replace(/\s+/g, ' '));
            this._conn.query(sql, params, (err: any, results: any, fields: any) => {
                if (err)
                    reject(new PiRestError(err));
                else {
                    if (results.affectedRows == 1)
                        resolve(results.insertId)
                    else {
                        let ids = new Array(results.affectedRows).fill(0)
                            .map((dummy, i) => results.insertId + i);
                        resolve(ids);
                    }
                }
            });
        });
    }

    update(sql: string, params?: any): Promise<any> {
        sql = this._parseNamedParams(sql, params);
        return new Promise((resolve, reject) => {
            console.debug('SQL> ', sql.replace(/\s+/g, ' '));
            this._conn.query(sql, params, (err: any, results: any, fields: any) => {
                if (err)
                    reject(new PiRestError(err));
                else
                    resolve(results.affectedRows);
            });
        });
    }

    close(): Promise<void> {
        return new Promise((resolve, reject) =>
            this._conn.end(err => err ? reject(err) : resolve())
        );
    }

    private _parseNamedParams(sql: string, params: object): string {
        sql = sql.trim();
        if (params) {
            sql = sql.replace(/:([a-z_][\w.]*)/gi, (p, id) => {
                let val = getValue(params, id);
                if (val === undefined) {
                    console.warn(`WARN: SQL Parameter '${p}' not defined. Using null`);
                    val = null;
                }
                return this._conn.escape(val);
            });
        }
        return sql;

        function getValue(obj: any, prop: string) {
            let val = obj;
            for (let p of prop.split('.'))
                val = val[p];
            return val;
        }
    }
};

function column2camel(col: string, options: Options) {
    col = col.toLowerCase();
    return options.map && options.map[col] ||
        col.replace(/_(.)/g, (g, g1) => g1.toUpperCase());
}
