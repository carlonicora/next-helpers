import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { ApiResponseInterface } from "../interfaces/ApiResponseInterface";
export declare class ApiDataFactory {
    private static _request;
    static get<T extends ApiDataInterface>(factory: () => T, params?: any): Promise<ApiResponseInterface>;
    static post<T extends ApiDataInterface>(factory: () => T, params?: any, body?: any): Promise<ApiResponseInterface>;
    static put<T extends ApiDataInterface>(factory: () => T, params?: any, body?: any): Promise<ApiResponseInterface>;
    static patch<T extends ApiDataInterface>(factory: () => T, params?: any, body?: any): Promise<ApiResponseInterface>;
    static delete<T extends ApiDataInterface>(factory: () => T, params?: any): Promise<ApiResponseInterface>;
}
