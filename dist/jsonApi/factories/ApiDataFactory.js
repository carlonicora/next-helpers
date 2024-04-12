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
exports.ApiDataFactory = void 0;
const cookies_next_1 = require("cookies-next");
class ApiDataFactory {
    static registerObjectClass(key, classConstructor) {
        if (!this.classMap.has(key))
            this.classMap.set(key, classConstructor);
    }
    static async _request(method, classKey, params, body, files) {
        const factoryClass = this.classMap.get(classKey);
        if (!factoryClass) {
            throw new Error(`Class not registered for key: ${classKey}`);
        }
        const response = {
            ok: true,
            response: 0,
            data: [],
            error: "",
        };
        let link = params?.link;
        if (!link)
            link = new factoryClass().generateApiUrl(params);
        let apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
        let siteId = "";
        let token = undefined;
        if (typeof window === "undefined") {
            const serverCookies = await Promise.resolve().then(() => __importStar(require("next/headers")));
            const cookieStore = serverCookies.cookies();
            siteId = cookieStore.get("siteId")?.value ?? "";
            apiUrl = apiUrl.replace("*", siteId);
            token =
                cookieStore.get("next-auth.session-token")?.value ??
                    cookieStore.get("__Secure-next-auth.session-token")?.value ??
                    undefined;
            if (!link.startsWith("http"))
                link = apiUrl + link;
        }
        else {
            siteId = (0, cookies_next_1.getCookie)("siteId") ?? "";
            apiUrl = apiUrl.replace("*", siteId);
            if (link.startsWith("http"))
                link = link.substring(apiUrl?.length ?? 0);
            link = "/api/nexthelper?uri=" + encodeURIComponent(link);
        }
        if (siteId !== "")
            link = link.replace("*", siteId);
        const additionalHeaders = {};
        if (params?.headers) {
            Object.keys(params.headers).forEach((key) => {
                if (key.startsWith("next-helper"))
                    additionalHeaders[key] = params.headers[key];
            });
        }
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
        else {
            requestBody = JSON.stringify(body);
            additionalHeaders["Content-Type"] = "application/json";
        }
        const options = {
            method: method,
            headers: {
                Accept: "application/json",
                ...additionalHeaders,
            },
            cache: "no-store",
            body: requestBody,
        };
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
            }
            catch (e) {
                response.error = apiResponse.statusText;
            }
            return response;
        }
        if (apiResponse.status === 204)
            return response;
        try {
            const jsonApi = await apiResponse.json();
            const included = jsonApi.included ?? [];
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
                const responseData = [];
                for (const data of jsonApi.data) {
                    const object = new factoryClass();
                    object.rehydrate({ jsonApi: data, included: included });
                    responseData.push(object);
                }
                response.data = responseData;
            }
            else {
                const responseData = new factoryClass();
                responseData.rehydrate({ jsonApi: jsonApi.data, included: included });
                response.data = responseData;
            }
        }
        catch (e) {
            console.error(e);
        }
        return response;
    }
    static async get(classKey, params) {
        return this._request("GET", classKey, params);
    }
    static async getData(classKey, params) {
        const data = await this.get(classKey, params);
        if (!data.ok)
            throw new Error(data.error);
        return data.data;
    }
    static async post(classKey, params, body, files) {
        if (!body)
            body = {};
        return this._request("POST", classKey, params, body, files);
    }
    static async put(classKey, params, body, files) {
        return this._request("PUT", classKey, params, body, files);
    }
    static async patch(classKey, params, body, files) {
        return this._request("PATCH", classKey, params, body, files);
    }
    static async delete(classKey, params) {
        return this._request("DELETE", classKey, params);
    }
}
exports.ApiDataFactory = ApiDataFactory;
ApiDataFactory.classMap = new Map();
//# sourceMappingURL=ApiDataFactory.js.map