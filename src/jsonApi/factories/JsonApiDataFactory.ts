import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { ApiDataFactory } from "./ApiDataFactory";

export class JsonApiDataFactory {
	public static create(classKey: string, data: any): any {
		const factoryClass = ApiDataFactory.classMap.get(classKey);

		if (!factoryClass) throw new Error(`Class not registered for key: ${classKey}`);

		const instance = new factoryClass() as ApiDataInterface;
		return instance.createJsonApi(data);
	}
}
