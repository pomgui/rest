import { Request, Response, Router, IRouterMatcher, Application } from "express";
import {
    PiServiceOptions, PiExceptionHandlerParams,
    PiSecurityDef, PiSecurityDefItem, PiSecurity
} from "./types";
import { PiTypeDescriptor, PiRestError } from '@pomgui/rest-lib';
import { PiDatabasePool } from '@pomgui/database';
import { assert } from 'console';

var
    _router: Router = Router(),
    _dbPool: PiDatabasePool | undefined,
    _security: PiSecurityDef;

export function PiGET(path: string, options?: PiServiceOptions) { return decorator(path, _router.get, options) }
export function PiPOST(path: string, options?: PiServiceOptions) { return decorator(path, _router.post, options) }
export function PiPUT(path: string, options?: PiServiceOptions) { return decorator(path, _router.put, options) }
export function PiPATCH(path: string, options?: PiServiceOptions) { return decorator(path, _router.patch, options) }
export function PiDELETE(path: string, options?: PiServiceOptions) { return decorator(path, _router.delete, options) }

function decorator(path: string, defineRoute: IRouterMatcher<void>, options?: PiServiceOptions) {
    const opts = Object.assign({ database: true, errorHandler: defaultErrorHandler }, options);
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const orig = descriptor.value;

        /** Real operation */
        const operation = async (req: Request, res: Response): Promise<any> => {
            const db = (_dbPool && !opts.noDb) ? await _dbPool.get() : null;
            const desc = opts.descriptor && (opts.descriptor.o || (opts.descriptor.o = new PiTypeDescriptor(opts.descriptor)));
            const security = opts.security ? checkSecurity(opts.security, req) : Promise.resolve(true);

            if (db) {
                let result: any;
                return security
                    .then(() => db.beginTransaction())
                    .then(() => orig.call(target, normalizeQueryParams(req, desc), db, req, res))
                    .then(r => result = r)
                    .then(() => db.commit())
                    .then(() => opts.customSend || res.send(result))
                    .catch(error => opts.errorHandler!({ db, req, res, error }))
                    .finally(() => db.close())
                    .catch(error => opts.errorHandler!({ db: null, req, res, error }));
            } else
                return security
                    .then(() => orig.call(target, normalizeQueryParams(req, desc), req, res))
                    .then(result => opts.customSend || res.send(result))
                    .catch(error => opts.errorHandler!({ db: null, req, res, error }));
        };
        defineRoute.call(_router, path, operation as Application);
    }

    function defaultErrorHandler(options: PiExceptionHandlerParams): Promise<void> {
        options.res.set('Content-Type', 'application/json; charset=utf-8')
            .status((<any>options.error).status || 500)
            .send(plain(options.error));
        // console.error('PiService catch: ', options.error);
        return options.db ? options.db.rollback() : Promise.resolve()
    }

    function normalizeQueryParams(req: Request, desc?: PiTypeDescriptor): object {
        let params = {
            path: Object.assign({}, req.params),
            query: Object.assign({}, req.query),
            headers: Object.assign({}, req.headers),
            body: Object.assign({}, req.body)
        };
        if (desc) desc.cast(params);
        let ret = Object.assign({}, params.path, params.query, params.body);
        if (desc)
            // Only the defined headers in the descriptor
            Object.keys(params.headers).filter(h => desc.has(h)).forEach(h => ret[h] = params.headers[h]);
        else
            Object.assign(ret, params.headers);
        return ret;
    }

    function plain(err: any) {
        if (Array.isArray(err) || typeof err != 'object') return err;
        const plainObj: any = {};
        if (err.message)
            plainObj.message = err.message;
        if (err.data)
            plainObj.data = plain(err.data);
        return plainObj;
    }

    async function checkSecurity(security: PiSecurity | PiSecurity[], req: Request): Promise<boolean> {
        security = Array.isArray(security) ? security : [security];
        const ORlist = security.map(sec => checkSecurityAnd(sec, req));
        const ORresult = await Promise.all(ORlist);
        const accessGranted = ORresult.some(b => b);
        if (!accessGranted)
            throw new PiRestError('Unauthorized', 403);
        return accessGranted;
    }

    async function checkSecurityAnd(items: { [secname: string]: string[] }, req: Request): Promise<boolean> {
        const ANDlist = Object.entries(items)
            .map(([secname, values]) => {
                const def = _security.definition[secname];
                assert(def, `OpenApi spec: securityDefinitions does not define '${secname}'`);
                const value = getSecItemValue(def, req);
                const promiseLike = _security.validator(secname, value);
                return Promise.resolve(promiseLike);
            })
        const ANDresult = await Promise.all(ANDlist);
        return !ANDresult.some(b => !b);
    }

    function getSecItemValue(def: PiSecurityDefItem, req: Request): string | string[] | undefined {
        if (def.type == 'basic') {
            const value = req.headers.authorization;
            if (value) {
                const decoded = new Buffer(value, 'base64');
                return decoded.toString('utf8');
            }
        } else {
            if (def.in == 'header')
                return req.headers[def.name.toLowerCase()];
            if (def.in == 'query')
                return req.query[def.name] as any;
        }
        return undefined;
    }
}

export function PiService(config: {
    services: { new(): any }[],
    dbPool?: PiDatabasePool,
    security?: PiSecurityDef
}): Router {
    config.services.forEach(s => new s()); // Create an instance, just to access to the decorators
    if (config.security) _security = config.security;
    _dbPool = config.dbPool;
    return _router;
}
