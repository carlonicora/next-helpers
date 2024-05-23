import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "../interfaces/ApiRequestDataTypeInterface";
import { ApiDataFactory } from "./ApiDataFactory";

export class JsonApiDataFactory {
  public static create(
    classKey: string | ApiRequestDataTypeInterface,
    data: any,
  ): any {
    const factoryClass = ApiDataFactory.classMap.get(
      typeof classKey === "string" ? classKey : classKey.name,
    );

    if (!factoryClass)
      throw new Error(
        `Class not registered for key: ${
          typeof classKey === "string" ? classKey : classKey.name
        }`,
      );

    const instance = new factoryClass() as ApiDataInterface;
    return instance.createJsonApi(data);
  }
}
