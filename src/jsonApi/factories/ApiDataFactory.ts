import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { ApiResponseInterface } from "../interfaces/ApiResponseInterface";

export class ApiDataFactory {
	public static classMap = new Map<string, { new (): ApiDataInterface }>();

	public static registerObjectClass(key: string, classConstructor: { new (): ApiDataInterface }) {
		if (!this.classMap.has(key)) this.classMap.set(key, classConstructor);
	}

	private static async _request<T extends ApiDataInterface>(
		method: string,
		classKey: string,
		params?: any,
		body?: any
	): Promise<ApiResponseInterface> {
		const factoryClass = this.classMap.get(classKey);

		if (!factoryClass) {
			throw new Error(`Class not registered for key: ${classKey}`);
		}

		const response: ApiResponseInterface = {
			ok: true,
			response: 0,
			data: [],
			error: "",
		};

		let link = params?.link;
		if (!link) link = new factoryClass().generateApiUrl(params);

		let token: string | undefined = undefined;
		if (typeof window === "undefined") {
			const serverCookies = await import("next/headers");
			const cookieStore = serverCookies.cookies();

			token =
				cookieStore.get("next-auth.session-token")?.value ??
				cookieStore.get("__Secure-next-auth.session-token")?.value ??
				undefined;
			if (!link.startsWith("http")) link = process.env.NEXT_PUBLIC_API_URL + link;
		} else {
			if (link.startsWith("http")) link = link.substring(process.env.NEXT_PUBLIC_API_URL?.length ?? 0);
			link = process.env.NEXT_PUBLIC_INTERNAL_API_URL + "?uri=" + encodeURIComponent(link);
		}

		const options: RequestInit = {
			method: method,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: body ? JSON.stringify(body) : undefined,
		};

		if (token) {
			options.headers = {
				...options.headers,
				Authorization: `Bearer ${token}`,
			};
		}

		//if (params?.revalidate) options.cache = "reload";
		options.cache = "force-cache";

		const apiResponse = await fetch(link, options);

		response.ok = apiResponse.ok;
		response.response = apiResponse.status;

		if (!apiResponse.ok) {
			const json = await apiResponse.json();
			if (json.message !== undefined) {
				if (Array.isArray(json.message)) {
					response.error = json.message.join(", ");
				} else {
					response.error = json.message;
				}
			} else {
				response.error = apiResponse.statusText;
			}
			return response;
		}

		if (apiResponse.status === 204) return response;

		try {
			const jsonApi: any = await apiResponse.json();

			const included: any = jsonApi.included ?? [];

			if (jsonApi.links) {
				response.self = jsonApi.links.self;

				if (jsonApi.links.next) {
					response.next = jsonApi.links.next;
					response.nextPage = async () => ApiDataFactory.get(classKey, { link: jsonApi.links.next });
				}

				if (jsonApi.links.prev) {
					response.prev = jsonApi.links.prev;
					response.prevPage = async () => ApiDataFactory.get(classKey, { link: jsonApi.links.prev });
				}
			}

			if (Array.isArray(jsonApi.data)) {
				const responseData: T[] = [];

				for (const data of jsonApi.data) {
					const object = new factoryClass();
					object.rehydrate({ jsonApi: data, included: included });
					responseData.push(object as T);
				}

				response.data = responseData;
			} else {
				const responseData = new factoryClass();
				responseData.rehydrate({ jsonApi: jsonApi.data, included: included });

				response.data = responseData;
			}
		} catch (e) {
			console.error(e);
		}

		return response;
	}

	public static async get<T extends ApiDataInterface>(classKey: string, params?: any): Promise<ApiResponseInterface> {
		return this._request<T>("GET", classKey, params);
	}

	public static async post<T extends ApiDataInterface>(
		classKey: string,
		params?: any,
		body?: any
	): Promise<ApiResponseInterface> {
		if (!body) body = {};
		return this._request<T>("POST", classKey, params, body);
	}

	public static async put<T extends ApiDataInterface>(
		classKey: string,
		params?: any,
		body?: any
	): Promise<ApiResponseInterface> {
		return this._request<T>("PUT", classKey, params, body);
	}

	public static async patch<T extends ApiDataInterface>(
		classKey: string,
		params?: any,
		body?: any
	): Promise<ApiResponseInterface> {
		return this._request<T>("PATCH", classKey, params, body);
	}

	public static async delete<T extends ApiDataInterface>(
		classKey: string,
		params?: any
	): Promise<ApiResponseInterface> {
		return this._request<T>("DELETE", classKey, params);
	}
}
