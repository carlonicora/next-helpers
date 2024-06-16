import { RehydrationFactory } from "../factories/RehydrationFactory";
import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "../interfaces/ApiRequestDataTypeInterface";
import { JsonApiHydratedDataInterface } from "../interfaces/JsonApiHydratedDataInterface";

export abstract class AbstractApiData implements ApiDataInterface {
  protected _jsonApi?: any;
  protected _included?: any[];

  protected _id?: string;
  protected _createdAt?: Date;
  protected _updatedAt?: Date;

  protected _self?: string;

  get id(): string {
    if (!this._id) throw new Error("Grocery ID is not set.");
    return this._id;
  }

  get self(): string | undefined {
    return this._self;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  get included(): any[] {
    return this._included ?? [];
  }

  ingestJsonApi(data: JsonApiHydratedDataInterface): void {}

  abstract generateApiUrl(params?: any): string;
  abstract createJsonApi(data: any): any;

  protected _readIncluded<T extends ApiDataInterface>(
    data: JsonApiHydratedDataInterface,
    type: string,
    dataType: string | ApiRequestDataTypeInterface,
  ): T | T[] {
    if (
      data.included === undefined ||
      data.included.length === 0 ||
      data.jsonApi.relationships === undefined ||
      data.jsonApi.relationships[type] === undefined ||
      data.jsonApi.relationships[type].data === undefined
    )
      return [];

    if (Array.isArray(data.jsonApi.relationships[type].data)) {
      const response: T[] = data.jsonApi.relationships[type].data.map(
        (jsonApiData: any) => {
          const includedData = data.included.find(
            (includedData: any) =>
              includedData.id === jsonApiData.id &&
              includedData.type === jsonApiData.type,
          );

          if (includedData === undefined) return undefined;

          return RehydrationFactory.rehydrate(
            typeof dataType === "string" ? dataType : dataType.name,
            { jsonApi: includedData, included: data.included },
          ) as T;
        },
      );

      return response.filter(
        (item: T | undefined) => item !== undefined,
      ) as T[];
    }

    const includedData = data.included.find(
      (includedData: any) =>
        includedData.id === data.jsonApi.relationships[type].data.id &&
        includedData.type === data.jsonApi.relationships[type].data.type,
    );

    if (includedData === undefined) return undefined;

    return RehydrationFactory.rehydrate(
      typeof dataType === "string" ? dataType : dataType.name,
      { jsonApi: includedData, included: data.included },
    ) as T;
  }

  dehydrate(): JsonApiHydratedDataInterface {
    return {
      jsonApi: this._jsonApi,
      included: this._included ?? [],
    };
  }

  rehydrate(data: JsonApiHydratedDataInterface): this {
    this._jsonApi = data.jsonApi;
    this._included = data.included;

    this._id = this._jsonApi.id;
    this._createdAt =
      this._jsonApi.meta.createdAt !== undefined
        ? new Date(this._jsonApi.meta.createdAt)
        : undefined;
    this._updatedAt =
      this._jsonApi.meta.updatedAt !== undefined
        ? new Date(this._jsonApi.meta.updatedAt)
        : undefined;

    this._self = this._jsonApi.links?.self ?? undefined;

    return this;
  }
}
