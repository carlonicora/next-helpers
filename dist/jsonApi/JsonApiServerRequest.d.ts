import { ApiData } from "./interfaces/ApiData";
export declare function JsonApiServerRequest(method: string, link: string, cache?: number, body?: any, files?: FileList | File | {
    [key: string]: File;
}, token?: string, refreshToken?: string): Promise<ApiData>;
