import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { ApiResponseInterface } from "../interfaces/ApiResponseInterface";
export declare class ApiDataFactory {
    static classMap: Map<string, new () => ApiDataInterface>;
    private static _apiUrl;
    static registerApiUrl(url: string): void;
    static registerObjectClass(key: string, classConstructor: {
        new (): ApiDataInterface;
    }): void;
    private static _request;
    static get<T extends ApiDataInterface>(classKey: string, params?: any): Promise<ApiResponseInterface>;
    static getData<T extends ApiDataInterface>(classKey: string, params?: any): Promise<T | T[]>;
    static post<T extends ApiDataInterface>(classKey: string, params?: any, body?: any): Promise<ApiResponseInterface>;
    static put<T extends ApiDataInterface>(classKey: string, params?: any, body?: any): Promise<ApiResponseInterface>;
    static patch<T extends ApiDataInterface>(classKey: string, params?: any, body?: any): Promise<ApiResponseInterface>;
    static delete<T extends ApiDataInterface>(classKey: string, params?: any): Promise<ApiResponseInterface>;
}
