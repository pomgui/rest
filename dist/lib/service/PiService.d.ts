import { Router } from "express";
import { PiDbFactoryFn, PiServiceOptions } from "./types";
export declare function PiGET(path: string, options?: PiServiceOptions): (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;
export declare function PiPOST(path: string, options?: PiServiceOptions): (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;
export declare function PiPUT(path: string, options?: PiServiceOptions): (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;
export declare function PiPATCH(path: string, options?: PiServiceOptions): (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;
export declare function PiDELETE(path: string, options?: PiServiceOptions): (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;
export declare function PiService(config: {
    services: {
        new (): any;
    }[];
    dbFactoryFn: PiDbFactoryFn;
}): Router;
