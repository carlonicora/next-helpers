import { DataClass } from "../DataClass";
import { ApiData } from "./interfaces/ApiData";
import { ApiDataInterface } from "./interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "./interfaces/ApiRequestDataTypeInterface";
import { ApiResponseInterface } from "./interfaces/ApiResponseInterface";
import { JsonApiServerRequest } from "./JsonApiServerRequest";

function generateLink(
  classKey: ApiRequestDataTypeInterface,
  params?: any,
): string {
  if (params.link) return params.link;

  const factoryClass = DataClass.get(classKey);

  return `${
    process.env.NEXT_PUBLIC_API_URL ?? ""
  }${new factoryClass().generateApiUrl(params)}`;
}

async function translateResponse<T extends ApiDataInterface>(
  classKey: ApiRequestDataTypeInterface,
  apiResponse: ApiData,
): Promise<ApiResponseInterface> {
  const response: ApiResponseInterface = {
    ok: true,
    response: 0,
    data: [],
    error: "",
  };

  const factoryClass = DataClass.get(classKey);

  if (!factoryClass) {
    throw new Error(
      `Class not registered for key: ${
        typeof classKey === "string" ? classKey : classKey.name
      }`,
    );
  }

  response.ok = apiResponse.ok;
  response.response = apiResponse.status;

  if (!apiResponse.ok) {
    response.error = apiResponse?.data?.message ?? apiResponse.statusText;
    return response;
  }

  if (apiResponse.status === 204) return response;

  try {
    const included: any = apiResponse.data.included ?? [];

    if (apiResponse.data.links) {
      response.self = apiResponse.data.links.self;

      if (apiResponse.data.links.next) {
        response.next = apiResponse.data.links.next;
        response.nextPage = async () =>
          JsonApiGet(classKey, {
            link: apiResponse.data.links.next,
          });
      }

      if (apiResponse.data.links.prev) {
        response.prev = apiResponse.data.links.prev;
        response.prevPage = async () =>
          JsonApiGet(classKey, {
            link: apiResponse.data.links.prev,
          });
      }
    }

    if (Array.isArray(apiResponse.data.data)) {
      const responseData: T[] = [];

      for (const data of apiResponse.data.data) {
        const object = new factoryClass();
        object.rehydrate({ jsonApi: data, included: included });
        responseData.push(object as T);
      }

      response.data = responseData;
    } else {
      const responseData = new factoryClass();
      responseData.rehydrate({
        jsonApi: apiResponse.data.data,
        included: included,
      });

      response.data = responseData;
    }
  } catch (e) {
    console.error(e);
  }

  return response;
}

export async function JsonApiGet(
  classKey: ApiRequestDataTypeInterface,
  params?: any,
  token?: string,
): Promise<ApiResponseInterface> {
  const apiResponse: ApiData = await JsonApiServerRequest(
    "GET",
    generateLink(classKey, params),
    classKey.cache,
    undefined,
    undefined,
    token,
  );

  return translateResponse(classKey, apiResponse);
}

export async function JsonApiGetData<T extends ApiDataInterface>(
  classKey: ApiRequestDataTypeInterface,
  params?: any,
  token?: string,
): Promise<T | T[]> {
  const data = await JsonApiGet(classKey, params, token);

  if (!data.ok) throw new Error(data.error);

  return data.data as T | T[];
}

export async function JsonApiPost(
  classKey: ApiRequestDataTypeInterface,
  params?: any,
  body?: any,
  files?: FileList | File | { [key: string]: File },
  token?: string,
): Promise<ApiResponseInterface> {
  if (!body) body = {};
  const apiResponse: ApiData = await JsonApiServerRequest(
    "POST",
    generateLink(classKey, params),
    classKey.cache,
    body,
    files,
    token,
  );

  return translateResponse(classKey, apiResponse);
}

export async function JsonApiPut(
  classKey: ApiRequestDataTypeInterface,
  params?: any,
  body?: any,
  files?: FileList | File | { [key: string]: File },
  token?: string,
): Promise<ApiResponseInterface> {
  const apiResponse: ApiData = await JsonApiServerRequest(
    "PUT",
    generateLink(classKey, params),
    classKey.cache,
    body,
    files,
    token,
  );

  return translateResponse(classKey, apiResponse);
}

export async function JsonApiPatch(
  classKey: ApiRequestDataTypeInterface,
  params?: any,
  body?: any,
  files?: FileList | File | { [key: string]: File },
  token?: string,
): Promise<ApiResponseInterface> {
  const apiResponse: ApiData = await JsonApiServerRequest(
    "PATCH",
    generateLink(classKey, params),
    classKey.cache,
    body,
    files,
    token,
  );

  return translateResponse(classKey, apiResponse);
}

export async function JsonApiDelete(
  classKey: ApiRequestDataTypeInterface,
  params?: any,
  token?: string,
): Promise<ApiResponseInterface> {
  const apiResponse: ApiData = await JsonApiServerRequest(
    "DELETE",
    generateLink(classKey, params),
    classKey.cache,
    token,
  );

  return translateResponse(classKey, apiResponse);
}
