import { PiDatabase, Options } from './PiDatabase';

export class PiNoopDatabase extends PiDatabase {
    beginTransaction(): Promise<void> { return Promise.resolve() }
    commit(): Promise<void> { return Promise.resolve() }
    rollback(): Promise<void> { return Promise.resolve() }
    query(sql: string, params: object, options?: Options): Promise<any | any[]> { return Promise.resolve() }
    insert(sql: string, params?: object): Promise<any | any[]> { return Promise.resolve(1) }
    update(sql: string, params?: object): Promise<number> { return Promise.resolve(1) }
    close(): Promise<void> { return Promise.resolve() }
};
