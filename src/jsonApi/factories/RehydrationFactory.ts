import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { JsonApiHydratedDataInterface } from "../interfaces/JsonApiHydratedDataInterface";
import { ApiDataFactory } from "./ApiDataFactory";

export class RehydrationFactory {
	public static rehydrate<T extends ApiDataInterface>(classKey: string, data: JsonApiHydratedDataInterface): T {
		const factoryClass = ApiDataFactory.classMap.get(classKey);

		if (!factoryClass) throw new Error(`Class not registered for key: ${classKey}`);

		const instance = new factoryClass();
		return instance.rehydrate(data) as T;
	}

	public static rehydrateList<T extends ApiDataInterface>(classKey: string, data: JsonApiHydratedDataInterface[]): T[] {
		const factoryClass = ApiDataFactory.classMap.get(classKey);

		if (!factoryClass) throw new Error(`Class not registered for key: ${classKey}`);

		const response = data.map((item: JsonApiHydratedDataInterface) => {
			const instance = new factoryClass();
			return instance.rehydrate(item) as T;
		});

		return response;
	}
}
