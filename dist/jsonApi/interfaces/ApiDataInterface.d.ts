import { JsonApiHydratedDataInterface } from "./JsonApiHydratedDataInterface";
export interface ApiDataInterface {
    get included(): any[];
    get id(): string;
    get self(): string | undefined;
    generateApiUrl(params?: any): string;
    dehydrate(): JsonApiHydratedDataInterface;
    rehydrate(data: JsonApiHydratedDataInterface): this;
}
