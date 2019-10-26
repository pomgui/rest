import { PiDatabase, Options } from './PiDatabase';
export declare class PiNoopDatabase extends PiDatabase {
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    query(sql: string, params: object, options?: Options): Promise<any | any[]>;
    insert(sql: string, params?: object): Promise<any | any[]>;
    update(sql: string, params?: object): Promise<number>;
    close(): Promise<void>;
}
