import { Request, Response, Router, IRouterMatcher, Application } from "express";
import { PiDbPoolFactoryFn, PiServiceOptions, PiExceptionHandlerParams } from "./types";
import { PiTypeDescriptor } from '@pomgui/rest-lib';
import { PiDatabasePool, PiDatabase } from '@pomgui/database';

var
    _router: Router = Router(),
    _dbPool: PiDatabasePool | null;

export function PiGET(path: string, options?: PiServiceOptions) { return decorator(path, _router.get, options) }
export function PiPOST(path: string, options?: PiServiceOptions) { return decorator(path, _router.post, options) }
export function PiPUT(path: string, options?: PiServiceOptions) { return decorator(path, _router.put, options) }
export function PiPATCH(path: string, options?: PiServiceOptions) { return decorator(path, _router.patch, options) }
export function PiDELETE(path: string, options?: PiServiceOptions) { return decorator(path, _router.delete, options) }

function decorator(path: string, defineRoute: IRouterMatcher<void>, options?: PiServiceOptions) {
    options = Object.assign({ database: true, errorHandler: defaultErrorHandler }, options);
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        let orig = descriptor.value;
        let operation = async (req: Request, res: Response): Promise<any> => {
            const db: PiDatabase | null = (_dbPool && options!.database) ? await _dbPool.get() : null;
            const desc = options!.descriptor && (options!.descriptor.o || (options!.descriptor.o = new PiTypeDescriptor(options!.descriptor)));

            if (db) {
                let result: any;
                return Promise.resolve()
                    .then(() => db.beginTransaction())
                    .then(() => orig.call(target, normalizeQueryParams(req, desc), { db, req, res }))
                    .then(r => result = r)
                    .then(() => db.commit())
                    .then(() => options!.customSend || res.send(result))
                    .catch(error => options!.errorHandler!({ db, req, res, error }))
                    .finally(() => db.close())
                    .catch(error => options!.errorHandler!({ db: null, req, res, error }));
            } else
                return Promise.resolve()
                    .then(() => orig.call(target, normalizeQueryParams(req, desc), { db, req, res }))
                    .then(result => options!.customSend || res.send(result))
                    .catch(error => options!.errorHandler!({ db: null, req, res, error }));
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
}

export function PiService(config: { services: { new(): any }[], dbPoolFactoryFn?: PiDbPoolFactoryFn }): Router {
    config.services.forEach(s => new s()); // Create an instance, just to access to the decorators
    if (config.dbPoolFactoryFn)
        _dbPool = config.dbPoolFactoryFn();
    return _router;
}
