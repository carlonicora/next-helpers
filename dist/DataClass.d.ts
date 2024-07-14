import { ApiDataInterface } from "./jsonApi/interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "./jsonApi/interfaces/ApiRequestDataTypeInterface";
export declare class DataClass {
    private static _map;
    static registerObjectClass(key: ApiRequestDataTypeInterface, classConstructor: {
        new (): ApiDataInterface;
    }): void;
    static get(classKey: ApiRequestDataTypeInterface): {
        new (): ApiDataInterface;
    };
}
