import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "../interfaces/ApiRequestDataTypeInterface";
import { JsonApiHydratedDataInterface } from "../interfaces/JsonApiHydratedDataInterface";
export declare class RehydrationFactory {
    static rehydrate<T extends ApiDataInterface>(classKey: string | ApiRequestDataTypeInterface, data: JsonApiHydratedDataInterface): T;
    static rehydrateList<T extends ApiDataInterface>(classKey: string | ApiRequestDataTypeInterface, data: JsonApiHydratedDataInterface[]): T[];
}
