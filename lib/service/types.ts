import { PiDatabase, PiDatabasePool } from "@pomgui/database"
import { Request, Response } from "express"
import { PiDescriptor } from '@pomgui/rest-lib'

/**
 * Signature of the database factory function 
 */
export type PiDbPoolFactoryFn = { (): PiDatabasePool | null; }

export type PiServiceOptions = {
    customSend?: boolean;
    database?: boolean;
    descriptor?: PiDescriptor,
    errorHandler?: PiExceptionHandler;
}

export type PiExtraParams = {
    /** Database connection (if there was defined a Databse Factory) */
    db: PiDatabase | null;
    /** Original Request from express */
    req: Request;
    /** Response to be used with express (use it with PiServiceOptions#customSend == true) */
    res: Response;
}

export interface PiExceptionHandlerParams extends PiExtraParams {
    error: Error;
}

/**
 * Signature of the exception handler
 */
export type PiExceptionHandler = {
    (state: PiExceptionHandlerParams): Promise<void>;
}

