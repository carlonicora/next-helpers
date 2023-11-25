import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { JsonApiHydratedDataInterface } from "../interfaces/JsonApiHydratedDataInterface";
export declare abstract class AbstractApiData implements ApiDataInterface {
    get included(): any[];
    protected _jsonApi?: any;
    protected _included?: any[];
    protected _id?: string;
    protected _self?: string;
    get id(): string;
    get self(): string | undefined;
    ingestJsonApi(data: JsonApiHydratedDataInterface): void;
    abstract generateApiUrl(params?: any): string;
    protected _readIncluded<T extends ApiDataInterface>(data: JsonApiHydratedDataInterface, type: string, factory: () => T): T | T[];
    dehydrate(): JsonApiHydratedDataInterface;
    rehydrate(data: JsonApiHydratedDataInterface): this;
}
