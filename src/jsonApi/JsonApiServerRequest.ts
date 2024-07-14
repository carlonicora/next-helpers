"use server";

import { updateToken } from "../auth/CookieAuth";
import { ApiData } from "./interfaces/ApiData";

export async function JsonApiServerRequest(
  method: string,
  link: string,
  cache?: number,
  body?: any,
  files?: FileList | File | { [key: string]: File },
  token?: string,
): Promise<ApiData> {
  "use server";

  const response: ApiData = {
    data: undefined,
    ok: false,
    status: 0,
    statusText: "",
  };

  if (!token) {
    const serverCookies = await import("next/headers");
    const cookieStore = serverCookies.cookies();

    token = cookieStore.get("token")?.value ?? undefined;
  }

  const additionalHeaders: any = {};

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
  } else if (body !== undefined) {
    requestBody = JSON.stringify(body);
    additionalHeaders["Content-Type"] = "application/json";
  }

  const options: RequestInit = {
    method: method,
    headers: {
      Accept: "application/json",
      ...additionalHeaders,
    },
  };

  if (requestBody !== undefined) options.body = requestBody;

  if (cache !== undefined && cache > 0 && method === "GET") {
    //@ts-ignore
    options.next = {
      revalidate: cache,
    };
  } else {
    options.cache = "no-store";
  }

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const apiResponse = await fetch(link, options);

  if (apiResponse.status === 401) {
    const serverCookies = await import("next/headers");
    const cookieStore = serverCookies.cookies();

    console.log("Refreshing token", cookieStore.get("refreshToken")?.value);

    const headers: HeadersInit = {};
    const options: RequestInit = {
      method: "POST",
      headers: headers,
    };
    const uri = `${
      process.env.NEXT_PUBLIC_API_URL
    }auth/refreshtoken/${cookieStore.get("refreshToken")?.value}`;
    const tokenRefreshResponse = await fetch(uri, options);

    if (tokenRefreshResponse.ok) {
      const data = await tokenRefreshResponse.json();

      updateToken({
        token: data.data.attributes.token,
        refreshToken: data.data.attributes.refreshToken,
      });

      return await JsonApiServerRequest(
        method,
        link,
        cache,
        body,
        files,
        data.token,
      );
    }
  }

  response.ok = apiResponse.ok;
  response.status = apiResponse.status;
  response.statusText = apiResponse.statusText;
  response.data = await apiResponse.json();

  return response;
}
