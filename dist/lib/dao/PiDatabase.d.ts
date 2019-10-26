export declare type Options = {
    map?: any;
    ignore?: string[];
};
export declare abstract class PiDatabase {
    /**
     * Starts a new transaction that will be finished with a commit or rollback
     */
    abstract beginTransaction(): Promise<void>;
    abstract commit(): Promise<void>;
    abstract rollback(): Promise<void>;
    /**
     * Executes a query instruction and returns the result or results converting all the column names to
     * camel-case format
     * @see Options
     * @param sql
     * @param params
     * @param options
     */
    abstract query(sql: string, params: object, options?: Options): Promise<any | any[]>;
    /**
     * Same as query(), but oriented to return one single record. If the record is not found it shall throw
     * an error 404
     * @param sql
     * @param params
     * @param options
     */
    querySingle(sql: string, params: object, options?: Options): Promise<object>;
    /**
     * Executes an insert instruction and returns the ID or IDs of the new inserted records.
     * @param sql
     * @param params
     */
    abstract insert(sql: string, params?: object): Promise<any | any[]>;
    /**
     * Executes an update instruction and returns the number of records affected
     * @param sql
     * @param params
     */
    abstract update(sql: string, params?: object): Promise<number>;
    /**
     * Closes the connection to the database
     */
    abstract close(): Promise<void>;
}
