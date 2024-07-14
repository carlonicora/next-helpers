import { DataClass } from "../../DataClass";
import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "../interfaces/ApiRequestDataTypeInterface";

export class JsonApiDataFactory {
  public static create(classKey: ApiRequestDataTypeInterface, data: any): any {
    const factoryClass = DataClass.get(classKey);

    const instance = new factoryClass() as ApiDataInterface;
    return instance.createJsonApi(data);
  }
}
