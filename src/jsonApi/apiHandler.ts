import type { NextApiResponse } from "next";
import { NextRequest } from "next/server";

export async function handleRequest(
  req: NextRequest,
  res: NextApiResponse,
  method: string,
) {
  const serverCookies = await import("next/headers");
  const cookieStore = serverCookies.cookies();

  const url = new URL(req.url ?? "");
  const searchParams = new URLSearchParams(url.search);
  let uri = decodeURIComponent(searchParams.get("uri") ?? "");

  if (!uri.startsWith("http")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    uri = apiUrl + uri;
  }

  const jwt = cookieStore.get("token")?.value;

  const headers: HeadersInit = {};
  req.headers.forEach((value, key) => {
    if (key !== "host") headers[key] = value;
  });

  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;

  const isMultipart = req.headers
    .get("content-type")
    ?.startsWith("multipart/form-data");

  const options: RequestInit = {
    method: method,
    headers: headers,
  };

  if (headers["next-helper-cache"]) {
    //@ts-ignore
    options.next = {
      revalidate: parseInt(headers["next-helper-cache"]),
    };
  } else {
    options.cache = "no-store";
  }

  if (["POST", "PUT", "PATCH"].includes(method) && isMultipart) {
    options.body = req.body;
    //@ts-ignore
    options.duplex = "half";
  } else if (["POST", "PUT", "PATCH"].includes(method)) {
    options.body = await req.text();
  }

  const response = await fetch(uri, options);

  if (response.status === 401) {
    const refreshToken = cookieStore.get("refreshToken")?.value ?? undefined;

    if (refreshToken !== undefined) {
      const headers: HeadersInit = {};
      const options: RequestInit = {
        method: "POST",
        headers: headers,
      };
      const uri = `${process.env.NEXT_PUBLIC_API_URL}auth/refreshtoken/${refreshToken}`;

      const tokenRefreshResponse = await fetch(uri, options);
      if (tokenRefreshResponse.ok) {
        const data = await tokenRefreshResponse.json();

        cookieStore.set({
          name: "token",
          value: data.data.attributes.token,
          httpOnly: true,
          path: "/",
        });
        cookieStore.set({
          name: "refreshToken",
          value: data.data.attributes.refreshToken,
          httpOnly: true,
          path: "/",
        });

        return await handleRequest(req, res, method);
      }
    }
  }

  return response;
}

export async function GET(req: NextRequest, res: NextApiResponse) {
  return handleRequest(req, res, "GET");
}

export async function POST(req: NextRequest, res: NextApiResponse) {
  return handleRequest(req, res, "POST");
}

export async function PATCH(req: NextRequest, res: NextApiResponse) {
  return handleRequest(req, res, "PATCH");
}

export async function PUT(req: NextRequest, res: NextApiResponse) {
  return handleRequest(req, res, "PUT");
}

export async function DELETE(req: NextRequest, res: NextApiResponse) {
  return handleRequest(req, res, "DELETE");
}
