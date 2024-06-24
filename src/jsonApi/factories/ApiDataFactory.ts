import { getCookie } from "cookies-next";
import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "../interfaces/ApiRequestDataTypeInterface";
import { ApiResponseInterface } from "../interfaces/ApiResponseInterface";

export class ApiDataFactory {
  public static classMap = new Map<string, { new (): ApiDataInterface }>();

  public static registerObjectClass(
    key: string | ApiRequestDataTypeInterface,
    classConstructor: { new (): ApiDataInterface },
  ) {
    const classKey = typeof key === "string" ? key : key.name;
    if (!this.classMap.has(classKey))
      this.classMap.set(classKey, classConstructor);
  }

  private static async _request<T extends ApiDataInterface>(
    method: string,
    classKey: string | ApiRequestDataTypeInterface,
    params?: any,
    body?: any,
    files?: FileList | File | { [key: string]: File },
  ): Promise<ApiResponseInterface> {
    const factoryClass =
      typeof classKey === "string"
        ? this.classMap.get(classKey)
        : this.classMap.get(classKey.name);

    if (!factoryClass) {
      throw new Error(
        `Class not registered for key: ${
          typeof classKey === "string" ? classKey : classKey.name
        }`,
      );
    }

    const response: ApiResponseInterface = {
      ok: true,
      response: 0,
      data: [],
      error: "",
    };

    let link = params?.link;
    if (!link) link = new factoryClass().generateApiUrl(params);

    let apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    let siteId = "";

    let token: string | undefined = undefined;
    if (typeof window === "undefined") {
      const serverCookies = await import("next/headers");
      const cookieStore = serverCookies.cookies();

      siteId = cookieStore.get("siteId")?.value ?? "";
      apiUrl = apiUrl.replace("*", siteId);

      token =
        cookieStore.get("next-auth.session-token")?.value ??
        cookieStore.get("__Secure-next-auth.session-token")?.value ??
        undefined;
      if (!link.startsWith("http")) link = apiUrl + link;
    } else {
      siteId = getCookie("siteId") ?? "";
      apiUrl = apiUrl.replace("*", siteId);
      if (link.startsWith("http")) link = link.substring(apiUrl?.length ?? 0);

      link = "/api/nexthelper?uri=" + encodeURIComponent(link);
    }

    if (siteId !== "") link = link.replace("*", siteId);

    const additionalHeaders: any = {};
    if (params?.headers) {
      Object.keys(params.headers).forEach((key) => {
        if (key.startsWith("next-helper"))
          additionalHeaders[key] = params.headers[key];
      });
    }
    if (typeof classKey !== "string" && classKey.cache)
      additionalHeaders["next-helper-cache"] = classKey.cache;

    let requestBody: BodyInit | undefined = undefined;

    if (files) {
      const formData = new FormData();
      if (body && typeof body === "object") {
        for (const key in body) {
          if (Object.prototype.hasOwnProperty.call(body, key)) {
            formData.append(
              key,
              typeof body[key] === "object"
                ? JSON.stringify(body[key])
                : body[key],
            );
          }
        }
      }
      if (files instanceof FileList) {
        for (let i = 0; i < files.length; i++) {
          formData.append("file" + i, files[i]);
        }
      } else if (files instanceof File) {
        formData.append("file", files);
      } else {
        for (const key in files) {
          if (files.hasOwnProperty(key)) {
            formData.append(key, files[key]);
          }
        }
      }

      requestBody = formData;
    } else {
      requestBody = JSON.stringify(body);
      additionalHeaders["Content-Type"] = "application/json";
    }

    const options: RequestInit = {
      method: method,
      headers: {
        Accept: "application/json",
        ...additionalHeaders,
      },
      cache: "no-store",
      body: requestBody,
    };

    if (typeof classKey !== "string" && classKey.cache && method === "GET") {
      //@ts-ignore
      options.next = {
        revalidate: classKey.cache,
      };
    }

    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const apiResponse = await fetch(link, options);

    response.ok = apiResponse.ok;
    response.response = apiResponse.status;

    if (!apiResponse.ok) {
      try {
        const json = await apiResponse.json();
        response.error = json?.message ?? apiResponse.statusText;
      } catch (e) {
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
          response.nextPage = async () =>
            ApiDataFactory.get(
              typeof classKey === "string" ? classKey : classKey.name,
              { link: jsonApi.links.next },
            );
        }

        if (jsonApi.links.prev) {
          response.prev = jsonApi.links.prev;
          response.prevPage = async () =>
            ApiDataFactory.get(
              typeof classKey === "string" ? classKey : classKey.name,
              { link: jsonApi.links.prev },
            );
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

  public static async get<T extends ApiDataInterface>(
    classKey: string | ApiRequestDataTypeInterface,
    params?: any,
  ): Promise<ApiResponseInterface> {
    return this._request<T>("GET", classKey, params);
  }

  public static async getData<T extends ApiDataInterface>(
    classKey: string | ApiRequestDataTypeInterface,
    params?: any,
  ): Promise<T | T[]> {
    const data = await this.get<T>(classKey, params);

    if (!data.ok) throw new Error(data.error);

    return data.data as T | T[];
  }

  public static async post<T extends ApiDataInterface>(
    classKey: string | ApiRequestDataTypeInterface,
    params?: any,
    body?: any,
    files?: FileList | File | { [key: string]: File },
  ): Promise<ApiResponseInterface> {
    if (!body) body = {};
    return this._request<T>("POST", classKey, params, body, files);
  }

  public static async put<T extends ApiDataInterface>(
    classKey: string | ApiRequestDataTypeInterface,
    params?: any,
    body?: any,
    files?: FileList | File | { [key: string]: File },
  ): Promise<ApiResponseInterface> {
    return this._request<T>("PUT", classKey, params, body, files);
  }

  public static async patch<T extends ApiDataInterface>(
    classKey: string | ApiRequestDataTypeInterface,
    params?: any,
    body?: any,
    files?: FileList | File | { [key: string]: File },
  ): Promise<ApiResponseInterface> {
    return this._request<T>("PATCH", classKey, params, body, files);
  }

  public static async delete<T extends ApiDataInterface>(
    classKey: string | ApiRequestDataTypeInterface,
    params?: any,
  ): Promise<ApiResponseInterface> {
    return this._request<T>("DELETE", classKey, params);
  }
}
