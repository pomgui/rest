import { PiDatabase } from "../dao/PiDatabase"
import { Request, Response } from "express"
import { PiTypeDescriptor } from "piservices-common";

/**
 * Signature of the database factory function 
 */
export type PiDbFactoryFn = { (): PiDatabase | null; }

export type PiServiceOptions = {
    customSend?: boolean;
    database?: boolean;
    descriptor?: PiTypeDescriptor,
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

