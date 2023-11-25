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
class ApiDataFactory {
    static async _request(method, factory, params, body) {
        const response = {
            ok: true,
            response: 0,
            data: [],
        };
        let link = params?.link;
        if (!link)
            link = factory().generateApiUrl(params);
        let token = undefined;
        if (typeof window === "undefined") {
            const serverCookies = await Promise.resolve().then(() => __importStar(require("next/headers")));
            const cookieStore = serverCookies.cookies();
            token =
                cookieStore.get("next-auth.session-token")?.value ??
                    cookieStore.get("__Secure-next-auth.session-token")?.value ??
                    undefined;
            if (!link.startsWith("http"))
                link = process.env.NEXT_PUBLIC_API_URL + link;
        }
        else {
            if (link.startsWith("http"))
                link = link.substring(process.env.NEXT_PUBLIC_API_URL?.length ?? 0);
            link = process.env.NEXT_PUBLIC_INTERNAL_API_URL + "?uri=" + encodeURIComponent(link);
        }
        const options = {
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
        if (params?.revalidate)
            options.cache = "reload";
        const apiResponse = await fetch(link, options);
        response.ok = apiResponse.ok;
        response.response = apiResponse.status;
        if (!apiResponse.ok) {
            response.error = apiResponse.statusText;
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
                    response.nextPage = async () => ApiDataFactory.get(factory, { link: jsonApi.links.next });
                }
                if (jsonApi.links.prev) {
                    response.prev = jsonApi.links.prev;
                    response.prevPage = async () => ApiDataFactory.get(factory, { link: jsonApi.links.prev });
                }
            }
            if (Array.isArray(jsonApi.data)) {
                const responseData = [];
                for (const data of jsonApi.data) {
                    const object = factory();
                    object.rehydrate({ jsonApi: data, included: included });
                    responseData.push(object);
                }
                response.data = responseData;
            }
            else {
                const responseData = factory();
                responseData.rehydrate({ jsonApi: jsonApi.data, included: included });
                response.data = responseData;
            }
        }
        catch (e) {
            console.error(e);
        }
        return response;
    }
    static async get(factory, params) {
        return this._request("GET", factory, params);
    }
    static async post(factory, params, body) {
        if (!body)
            body = {};
        return this._request("POST", factory, params, body);
    }
    static async put(factory, params, body) {
        return this._request("PUT", factory, params, body);
    }
    static async patch(factory, params, body) {
        return this._request("PATCH", factory, params, body);
    }
    static async delete(factory, params) {
        return this._request("DELETE", factory, params);
    }
}
exports.ApiDataFactory = ApiDataFactory;
//# sourceMappingURL=ApiDataFactory.js.map