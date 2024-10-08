import { JsonApiHydratedDataInterface } from "./JsonApiHydratedDataInterface";
export interface ApiDataInterface {
    get included(): any[];
    get type(): string;
    get id(): string;
    get createdAt(): Date | undefined;
    get updatedAt(): Date | undefined;
    get self(): string | undefined;
    generateApiUrl(params?: any): string;
    dehydrate(): JsonApiHydratedDataInterface;
    rehydrate(data: JsonApiHydratedDataInterface): this;
    createJsonApi(data: any): any;
}
