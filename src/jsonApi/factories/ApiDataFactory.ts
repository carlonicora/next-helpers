import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { ApiResponseInterface } from "../interfaces/ApiResponseInterface";

export class ApiDataFactory {
  public static classMap = new Map<string, { new (): ApiDataInterface }>();

  public static registerObjectClass(
    key: string,
    classConstructor: { new (): ApiDataInterface },
  ) {
    if (!this.classMap.has(key)) this.classMap.set(key, classConstructor);
  }

  private static async _request<T extends ApiDataInterface>(
    method: string,
    classKey: string,
    params?: any,
    body?: any,
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
      if (!link.startsWith("http"))
        link = process.env.NEXT_PUBLIC_API_URL + link;
    } else {
      if (link.startsWith("http"))
        link = link.substring(process.env.NEXT_PUBLIC_API_URL?.length ?? 0);
      link =
        process.env.NEXT_PUBLIC_INTERNAL_API_URL +
        "?uri=" +
        encodeURIComponent(link);
    }

    const additionalHeaders: any = {};
    if (params?.headers) {
      Object.keys(params.headers).forEach((key) => {
        if (key.startsWith("next-helper"))
          additionalHeaders[key] = params.headers[key];
      });
    }

    const options: RequestInit = {
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...additionalHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // if (typeof window !== "undefined") {
    // 	//@ts-ignore
    // 	options.next = {
    // 		revalidate: 3600,
    // 	};
    // }

    const apiResponse = await fetch(link, options);

    response.ok = apiResponse.ok;
    response.response = apiResponse.status;

    if (!apiResponse.ok) {
      response.error = apiResponse.statusText;
      return response;
    }

    if (apiResponse.status === 204) return response;

    try {
    } catch (e) {
      console.error(e);
    }

    return response;
  }

  public static async get<T extends ApiDataInterface>(
    classKey: string,
    params?: any,
  ): Promise<ApiResponseInterface> {
    return this._request<T>("GET", classKey, params);
  }

  public static async getData<T extends ApiDataInterface>(
    classKey: string,
    params?: any,
  ): Promise<T | T[]> {
    const data = await this.get<T>(classKey, params);

    if (!data.ok) throw new Error(data.error);

    return data.data as T | T[];
  }

  public static async post<T extends ApiDataInterface>(
    classKey: string,
    params?: any,
    body?: any,
  ): Promise<ApiResponseInterface> {
    if (!body) body = {};
    return this._request<T>("POST", classKey, params, body);
  }

  public static async put<T extends ApiDataInterface>(
    classKey: string,
    params?: any,
    body?: any,
  ): Promise<ApiResponseInterface> {
    return this._request<T>("PUT", classKey, params, body);
  }

  public static async patch<T extends ApiDataInterface>(
    classKey: string,
    params?: any,
    body?: any,
  ): Promise<ApiResponseInterface> {
    return this._request<T>("PATCH", classKey, params, body);
  }

  public static async delete<T extends ApiDataInterface>(
    classKey: string,
    params?: any,
  ): Promise<ApiResponseInterface> {
    return this._request<T>("DELETE", classKey, params);
  }
}
