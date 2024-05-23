import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "../interfaces/ApiRequestDataTypeInterface";
import { JsonApiHydratedDataInterface } from "../interfaces/JsonApiHydratedDataInterface";
import { ApiDataFactory } from "./ApiDataFactory";

export class RehydrationFactory {
  public static rehydrate<T extends ApiDataInterface>(
    classKey: string | ApiRequestDataTypeInterface,
    data: JsonApiHydratedDataInterface,
  ): T {
    const factoryClass = ApiDataFactory.classMap.get(
      typeof classKey === "string" ? classKey : classKey.name,
    );

    if (!factoryClass)
      throw new Error(
        `Class not registered for key: ${
          typeof classKey === "string" ? classKey : classKey.name
        }`,
      );

    const instance = new factoryClass();
    return instance.rehydrate(data) as T;
  }

  public static rehydrateList<T extends ApiDataInterface>(
    classKey: string | ApiRequestDataTypeInterface,
    data: JsonApiHydratedDataInterface[],
  ): T[] {
    const factoryClass = ApiDataFactory.classMap.get(
      typeof classKey === "string" ? classKey : classKey.name,
    );

    if (!factoryClass)
      throw new Error(
        `Class not registered for key: ${
          typeof classKey === "string" ? classKey : classKey.name
        }`,
      );

    const response = data.map((item: JsonApiHydratedDataInterface) => {
      const instance = new factoryClass();
      return instance.rehydrate(item) as T;
    });

    return response;
  }
}
