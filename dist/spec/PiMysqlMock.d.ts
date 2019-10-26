import 'sqlstring';
export declare type PiQueryCallback = {
    (error: any, result: any, fields: any): void;
};
export declare type PiQueryParams = {
    sql?: string;
    values?: any[];
    cb: PiQueryCallback;
};
export declare type PiActionType = 'query' | 'beginTransaction' | 'commit' | 'rollback' | 'end';
export declare class PiAction {
    private _mock;
    type: PiActionType;
    data: PiQueryParams;
    constructor(_mock: PiMysqlMock, type: PiActionType, data: PiQueryParams);
    resolve(error?: any, result?: any, fields?: any): void;
}
export declare class PiMysqlConnectionMock {
    private _mock;
    constructor(_mock: PiMysqlMock);
    beginTransaction(cb: {
        (error: any): void;
    }): void;
    commit(cb: {
        (error: any): void;
    }): void;
    rollback(cb: {
        (): void;
    }): void;
    query(sql: string, values: any[], cb: PiQueryCallback): void;
    end(cb: {
        (error: any): void;
    }): void;
    escape(value: any): any;
}
export declare class PiMysqlMock {
    private _actions;
    private _origCreateConnection;
    begin(): void;
    end(): void;
    addAction(type: PiActionType, query: PiQueryParams): void;
    removeAction(action: PiAction): void;
    expectOne(type: PiActionType, sql?: string | RegExp): PiAction;
}
