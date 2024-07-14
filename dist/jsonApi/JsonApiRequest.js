"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonApiDelete = exports.JsonApiPatch = exports.JsonApiPut = exports.JsonApiPost = exports.JsonApiGetData = exports.JsonApiGet = void 0;
const DataClass_1 = require("../DataClass");
const JsonApiServerRequest_1 = require("./JsonApiServerRequest");
function generateLink(classKey, params) {
    if (params.link)
        return params.link;
    const factoryClass = DataClass_1.DataClass.get(classKey);
    return `${process.env.NEXT_PUBLIC_API_URL ?? ""}${new factoryClass().generateApiUrl(params)}`;
}
async function translateResponse(classKey, apiResponse) {
    const response = {
        ok: true,
        response: 0,
        data: [],
        error: "",
    };
    const factoryClass = DataClass_1.DataClass.get(classKey);
    if (!factoryClass) {
        throw new Error(`Class not registered for key: ${typeof classKey === "string" ? classKey : classKey.name}`);
    }
    response.ok = apiResponse.ok;
    response.response = apiResponse.status;
    if (!apiResponse.ok) {
        response.error = apiResponse?.data?.message ?? apiResponse.statusText;
        return response;
    }
    if (apiResponse.status === 204)
        return response;
    try {
        const included = apiResponse.data.included ?? [];
        if (apiResponse.data.links) {
            response.self = apiResponse.data.links.self;
            if (apiResponse.data.links.next) {
                response.next = apiResponse.data.links.next;
                response.nextPage = async () => JsonApiGet(classKey, {
                    link: apiResponse.data.links.next,
                });
            }
            if (apiResponse.data.links.prev) {
                response.prev = apiResponse.data.links.prev;
                response.prevPage = async () => JsonApiGet(classKey, {
                    link: apiResponse.data.links.prev,
                });
            }
        }
        if (Array.isArray(apiResponse.data.data)) {
            const responseData = [];
            for (const data of apiResponse.data.data) {
                const object = new factoryClass();
                object.rehydrate({ jsonApi: data, included: included });
                responseData.push(object);
            }
            response.data = responseData;
        }
        else {
            const responseData = new factoryClass();
            responseData.rehydrate({
                jsonApi: apiResponse.data.data,
                included: included,
            });
            response.data = responseData;
        }
    }
    catch (e) {
        console.error(e);
    }
    return response;
}
async function JsonApiGet(classKey, params, token) {
    const apiResponse = await (0, JsonApiServerRequest_1.JsonApiServerRequest)("GET", generateLink(classKey, params), classKey.cache, undefined, undefined, token);
    return translateResponse(classKey, apiResponse);
}
exports.JsonApiGet = JsonApiGet;
async function JsonApiGetData(classKey, params, token) {
    const data = await JsonApiGet(classKey, params, token);
    if (!data.ok)
        throw new Error(data.error);
    return data.data;
}
exports.JsonApiGetData = JsonApiGetData;
async function JsonApiPost(classKey, params, body, files, token) {
    if (!body)
        body = {};
    const apiResponse = await (0, JsonApiServerRequest_1.JsonApiServerRequest)("POST", generateLink(classKey, params), classKey.cache, body, files, token);
    return translateResponse(classKey, apiResponse);
}
exports.JsonApiPost = JsonApiPost;
async function JsonApiPut(classKey, params, body, files, token) {
    const apiResponse = await (0, JsonApiServerRequest_1.JsonApiServerRequest)("PUT", generateLink(classKey, params), classKey.cache, body, files, token);
    return translateResponse(classKey, apiResponse);
}
exports.JsonApiPut = JsonApiPut;
async function JsonApiPatch(classKey, params, body, files, token) {
    const apiResponse = await (0, JsonApiServerRequest_1.JsonApiServerRequest)("PATCH", generateLink(classKey, params), classKey.cache, body, files, token);
    return translateResponse(classKey, apiResponse);
}
exports.JsonApiPatch = JsonApiPatch;
async function JsonApiDelete(classKey, params, token) {
    const apiResponse = await (0, JsonApiServerRequest_1.JsonApiServerRequest)("DELETE", generateLink(classKey, params), classKey.cache, token);
    return translateResponse(classKey, apiResponse);
}
exports.JsonApiDelete = JsonApiDelete;
//# sourceMappingURL=JsonApiRequest.js.map