import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { JsonApiHydratedDataInterface } from "../interfaces/JsonApiHydratedDataInterface";

export abstract class AbstractApiData implements ApiDataInterface {
	get included(): any[] {
		throw new Error("Method not implemented.");
	}
	protected _jsonApi?: any;
	protected _included?: any[];
	protected _id?: string;
	protected _self?: string;

	get id(): string {
		if (!this._id) throw new Error("Grocery ID is not set.");
		return this._id;
	}

	get self(): string | undefined {
		return this._self;
	}

	ingestJsonApi(data: JsonApiHydratedDataInterface): void {}

	abstract generateApiUrl(params?: any): string;

	protected _readIncluded<T extends ApiDataInterface>(
		data: JsonApiHydratedDataInterface,
		type: string,
		factory: () => T
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
			const response: T[] = data.jsonApi.relationships[type].data.map((jsonApiData: any) => {
				const includedData = data.included.find(
					(includedData: any) => includedData.id === jsonApiData.id && includedData.type === jsonApiData.type
				);

				if (includedData === undefined) return undefined;

				const object = factory();
				object.rehydrate({ jsonApi: includedData, included: data.included });
				return object;
			});

			return response.filter((item: T | undefined) => item !== undefined) as T[];
		}

		const includedData = data.included.find(
			(includedData: any) =>
				includedData.id === data.jsonApi.relationships[type].data.id &&
				includedData.type === data.jsonApi.relationships[type].data.type
		);

		const object = factory();
		object.rehydrate({ jsonApi: includedData, included: data.included });
		return object;
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
		this._self = this._jsonApi.links?.self ?? undefined;

		return this;
	}
}
