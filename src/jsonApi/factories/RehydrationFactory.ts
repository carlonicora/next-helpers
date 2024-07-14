import { DataClass } from "../../DataClass";
import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "../interfaces/ApiRequestDataTypeInterface";
import { JsonApiHydratedDataInterface } from "../interfaces/JsonApiHydratedDataInterface";

export class RehydrationFactory {
  public static rehydrate<T extends ApiDataInterface>(
    classKey: ApiRequestDataTypeInterface,
    data: JsonApiHydratedDataInterface,
  ): T {
    const factoryClass = DataClass.get(classKey);

    const instance = new factoryClass();
    return instance.rehydrate(data) as T;
  }

  public static rehydrateList<T extends ApiDataInterface>(
    classKey: ApiRequestDataTypeInterface,
    data: JsonApiHydratedDataInterface[],
  ): T[] {
    const factoryClass = DataClass.get(classKey);

    const response = data.map((item: JsonApiHydratedDataInterface) => {
      const instance = new factoryClass();
      return instance.rehydrate(item) as T;
    });

    return response;
  }
}
