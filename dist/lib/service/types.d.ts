import { PiDatabase } from "pidatabase";
import { Request, Response } from "express";
import { PiDescriptor } from 'pirest-lib';
/**
 * Signature of the database factory function
 */
export declare type PiDbFactoryFn = {
    (): PiDatabase | null;
};
export declare type PiServiceOptions = {
    customSend?: boolean;
    database?: boolean;
    descriptor?: PiDescriptor;
    errorHandler?: PiExceptionHandler;
};
export declare type PiExtraParams = {
    /** Database connection (if there was defined a Databse Factory) */
    db: PiDatabase | null;
    /** Original Request from express */
    req: Request;
    /** Response to be used with express (use it with PiServiceOptions#customSend == true) */
    res: Response;
};
export interface PiExceptionHandlerParams extends PiExtraParams {
    error: Error;
}
/**
 * Signature of the exception handler
 */
export declare type PiExceptionHandler = {
    (state: PiExceptionHandlerParams): Promise<void>;
};
