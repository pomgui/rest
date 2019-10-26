import { PiError } from "piservices-common";
export declare class PiRestError extends PiError {
    message: string;
    status: number;
    data?: any;
    constructor(message: string, status?: number, data?: any);
}
