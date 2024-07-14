"use strict";
"use server";
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
exports.JsonApiServerRequest = void 0;
const CookieAuth_1 = require("../auth/CookieAuth");
async function JsonApiServerRequest(method, link, cache, body, files, token) {
    "use server";
    const response = {
        data: undefined,
        ok: false,
        status: 0,
        statusText: "",
    };
    if (!token) {
        const serverCookies = await Promise.resolve().then(() => __importStar(require("next/headers")));
        const cookieStore = serverCookies.cookies();
        token = cookieStore.get("token")?.value ?? undefined;
    }
    const additionalHeaders = {};
    let requestBody = undefined;
    if (files) {
        const formData = new FormData();
        if (body && typeof body === "object") {
            for (const key in body) {
                if (Object.prototype.hasOwnProperty.call(body, key)) {
                    formData.append(key, typeof body[key] === "object"
                        ? JSON.stringify(body[key])
                        : body[key]);
                }
            }
        }
        if (files instanceof FileList) {
            for (let i = 0; i < files.length; i++) {
                formData.append("file" + i, files[i]);
            }
        }
        else if (files instanceof File) {
            formData.append("file", files);
        }
        else {
            for (const key in files) {
                if (files.hasOwnProperty(key)) {
                    formData.append(key, files[key]);
                }
            }
        }
        requestBody = formData;
    }
    else if (body !== undefined) {
        requestBody = JSON.stringify(body);
        additionalHeaders["Content-Type"] = "application/json";
    }
    const options = {
        method: method,
        headers: {
            Accept: "application/json",
            ...additionalHeaders,
        },
    };
    if (requestBody !== undefined)
        options.body = requestBody;
    if (cache !== undefined && cache > 0 && method === "GET") {
        options.next = {
            revalidate: cache,
        };
    }
    else {
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
        const serverCookies = await Promise.resolve().then(() => __importStar(require("next/headers")));
        const cookieStore = serverCookies.cookies();
        console.log("Refreshing token", cookieStore.get("refreshToken")?.value);
        const headers = {};
        const options = {
            method: "POST",
            headers: headers,
        };
        const uri = `${process.env.NEXT_PUBLIC_API_URL}auth/refreshtoken/${cookieStore.get("refreshToken")?.value}`;
        const tokenRefreshResponse = await fetch(uri, options);
        if (tokenRefreshResponse.ok) {
            const data = await tokenRefreshResponse.json();
            (0, CookieAuth_1.updateToken)({
                token: data.data.attributes.token,
                refreshToken: data.data.attributes.refreshToken,
            });
            return await JsonApiServerRequest(method, link, cache, body, files, data.token);
        }
    }
    response.ok = apiResponse.ok;
    response.status = apiResponse.status;
    response.statusText = apiResponse.statusText;
    response.data = await apiResponse.json();
    return response;
}
exports.JsonApiServerRequest = JsonApiServerRequest;
//# sourceMappingURL=JsonApiServerRequest.js.map