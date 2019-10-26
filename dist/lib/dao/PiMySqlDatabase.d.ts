import * as mysql from "mysql";
import { PiDatabase, Options } from "./PiDatabase";
export declare class PiMySqlDatabase extends PiDatabase {
    private _conn;
    constructor(connectionUri: string | mysql.ConnectionConfig);
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    query(sql: string, params: object, options?: Options): Promise<any>;
    insert(sql: string, params?: any): Promise<any | any[]>;
    update(sql: string, params?: any): Promise<any>;
    close(): Promise<void>;
    private _parseNamedParams;
}
