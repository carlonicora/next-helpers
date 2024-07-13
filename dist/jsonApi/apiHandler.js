"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.PUT = exports.PATCH = exports.POST = exports.GET = exports.handleRequest = void 0;
async function handleRequest(req, res, method) {
    const serverCookies = await Promise.resolve().then(() => __importStar(require("next/headers")));
    const cookieStore = serverCookies.cookies();
    const url = new URL(req.url ?? "");
    const searchParams = new URLSearchParams(url.search);
    let uri = decodeURIComponent(searchParams.get("uri") ?? "");
    if (!uri.startsWith("http")) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
        uri = apiUrl + uri;
    }
    const jwt = cookieStore.get("token")?.value;
    const headers = {};
    req.headers.forEach((value, key) => {
        if (key !== "host")
            headers[key] = value;
    });
    if (jwt)
        headers["Authorization"] = `Bearer ${jwt}`;
    const isMultipart = req.headers
        .get("content-type")
        ?.startsWith("multipart/form-data");
    const options = {
        method: method,
        headers: headers,
    };
    if (headers["next-helper-cache"]) {
        options.next = {
            revalidate: parseInt(headers["next-helper-cache"]),
        };
    }
    else {
        options.cache = "no-store";
    }
    if (["POST", "PUT", "PATCH"].includes(method) && isMultipart) {
        options.body = req.body;
        options.duplex = "half";
    }
    else if (["POST", "PUT", "PATCH"].includes(method)) {
        options.body = await req.text();
    }
    const response = await fetch(uri, options);
    if (response.status === 401) {
        const refreshToken = cookieStore.get("refreshToken")?.value ?? undefined;
        if (refreshToken !== undefined) {
            const headers = {};
            const options = {
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
exports.handleRequest = handleRequest;
async function GET(req, res) {
    return handleRequest(req, res, "GET");
}
exports.GET = GET;
async function POST(req, res) {
    return handleRequest(req, res, "POST");
}
exports.POST = POST;
async function PATCH(req, res) {
    return handleRequest(req, res, "PATCH");
}
exports.PATCH = PATCH;
async function PUT(req, res) {
    return handleRequest(req, res, "PUT");
}
exports.PUT = PUT;
async function DELETE(req, res) {
    return handleRequest(req, res, "DELETE");
}
exports.DELETE = DELETE;
//# sourceMappingURL=apiHandler.js.map