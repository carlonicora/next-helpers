import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { JsonApiHydratedDataInterface } from "../interfaces/JsonApiHydratedDataInterface";
export declare class RehydrationFactory {
    static rehydrate<T extends ApiDataInterface>(classKey: string, data: JsonApiHydratedDataInterface): T;
    static rehydrateList<T extends ApiDataInterface>(classKey: string, data: JsonApiHydratedDataInterface[]): T[];
}
