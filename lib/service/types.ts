import { PiDatabase, PiDatabasePool } from "@pomgui/database"
import { Request, Response } from "express"
import { PiDescriptor } from '@pomgui/rest-lib'

export type PiSecurity = {
    [secName: string]: string[]
};

export type PiServiceOptions = {
    customSend?: boolean;
    noDb?: boolean; // Don't use database for this operation
    descriptor?: PiDescriptor,
    errorHandler?: PiExceptionHandler;

    /** see https://swagger.io/docs/specification/2-0/authentication/ */
    security?: PiSecurity | PiSecurity[];
}

export interface PiExceptionHandlerParams {
    /** Database connection (if there was defined a Databse Factory) */
    db: PiDatabase | null;
    /** Original Request from express */
    req: Request;
    /** Response to be used with express (use it with PiServiceOptions#customSend == true) */
    res: Response;
    error: Error;
}

/**
 * Signature of the exception handler
 */
export type PiExceptionHandler = {
    (state: PiExceptionHandlerParams): Promise<void>;
}

export type PiSecurityValidator = {
    /**
     * Custom validator of the access token/basic auth.
     * @param name Name of the security definition on openapi spec.
     * @param scopes Security scope defined on each operation
     * @param requestValue Value to be validated. The content will depend on the type 
     *              of the security definition for that name.
     *              type    value
     *              ----    -------
     *              basic   base64-decoded value. It was sent in "Authorization" header.
     *              apiKey  Key sent in the header/query with the name defined in the spec.
     *              oauth2  Not supported.
     * @return true/false depending on the result of the validation.
     * NOTE: For multiple authentication types per operation, this validator
     * will be called once for each type, and internally will make the AND/OR
     * necessary to get the final result.
     * @see https://swagger.io/docs/specification/2-0/authentication/
     */
    (name: string, scopes: string[], requestValue: any): boolean | Promise<boolean>;
}

export type PiSecurityDefItem = {
    type: 'basic' | 'apiKey';
    in: 'header' | 'query';
    name: string;
};

export type PiSecurityDef = {
    definition: { [secName: string]: PiSecurityDefItem };
    validator: PiSecurityValidator;
};
