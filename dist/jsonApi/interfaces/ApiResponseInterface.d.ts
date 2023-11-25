import { ApiDataInterface } from "./ApiDataInterface";
export interface ApiResponseInterface {
    ok: boolean;
    response: number;
    self?: string;
    next?: string;
    prev?: string;
    nextPage?: () => Promise<ApiResponseInterface>;
    prevPage?: () => Promise<ApiResponseInterface>;
    data: ApiDataInterface | ApiDataInterface[];
    error?: string;
}
