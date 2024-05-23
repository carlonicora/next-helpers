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

  const jwt =
    cookieStore.get("next-auth.session-token")?.value ??
    cookieStore.get("__Secure-next-auth.session-token")?.value;

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
    options.cache = "force-cache";
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

  return await fetch(uri, options);
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
