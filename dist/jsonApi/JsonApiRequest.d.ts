import { ApiDataInterface } from "./interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "./interfaces/ApiRequestDataTypeInterface";
import { ApiResponseInterface } from "./interfaces/ApiResponseInterface";
export declare function JsonApiGet(classKey: ApiRequestDataTypeInterface, params?: any, token?: string): Promise<ApiResponseInterface>;
export declare function JsonApiGetData<T extends ApiDataInterface>(classKey: ApiRequestDataTypeInterface, params?: any, token?: string): Promise<T | T[]>;
export declare function JsonApiPost(classKey: ApiRequestDataTypeInterface, params?: any, body?: any, files?: FileList | File | {
    [key: string]: File;
}, token?: string): Promise<ApiResponseInterface>;
export declare function JsonApiPut(classKey: ApiRequestDataTypeInterface, params?: any, body?: any, files?: FileList | File | {
    [key: string]: File;
}, token?: string): Promise<ApiResponseInterface>;
export declare function JsonApiPatch(classKey: ApiRequestDataTypeInterface, params?: any, body?: any, files?: FileList | File | {
    [key: string]: File;
}, token?: string): Promise<ApiResponseInterface>;
export declare function JsonApiDelete(classKey: ApiRequestDataTypeInterface, params?: any, token?: string): Promise<ApiResponseInterface>;
