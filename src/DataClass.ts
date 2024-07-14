import { ApiDataInterface } from "./jsonApi/interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "./jsonApi/interfaces/ApiRequestDataTypeInterface";

export class DataClass {
  private static _map = new Map<string, { new (): ApiDataInterface }>();

  public static registerObjectClass(
    key: ApiRequestDataTypeInterface,
    classConstructor: { new (): ApiDataInterface },
  ) {
    const classKey = key.name;
    if (!this._map.has(classKey)) this._map.set(classKey, classConstructor);
  }

  public static get(classKey: ApiRequestDataTypeInterface): {
    new (): ApiDataInterface;
  } {
    const response = this._map.get(classKey.name);
    if (!response)
      throw new Error(
        `Class not registered for key: ${
          typeof classKey === "string" ? classKey : classKey.name
        }`,
      );

    return response;
  }
}
