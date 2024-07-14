"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RehydrationFactory = exports.JsonApiDataFactory = exports.ApiDataFactory = exports.handleRequest = exports.PUT = exports.POST = exports.PATCH = exports.GET = exports.DELETE = exports.AbstractApiData = exports.updateToken = void 0;
var CookieAuth_1 = require("./auth/CookieAuth");
Object.defineProperty(exports, "updateToken", { enumerable: true, get: function () { return CookieAuth_1.updateToken; } });
var AbstractApiData_1 = require("./jsonApi/abstracts/AbstractApiData");
Object.defineProperty(exports, "AbstractApiData", { enumerable: true, get: function () { return AbstractApiData_1.AbstractApiData; } });
var apiHandler_1 = require("./jsonApi/apiHandler");
Object.defineProperty(exports, "DELETE", { enumerable: true, get: function () { return apiHandler_1.DELETE; } });
Object.defineProperty(exports, "GET", { enumerable: true, get: function () { return apiHandler_1.GET; } });
Object.defineProperty(exports, "PATCH", { enumerable: true, get: function () { return apiHandler_1.PATCH; } });
Object.defineProperty(exports, "POST", { enumerable: true, get: function () { return apiHandler_1.POST; } });
Object.defineProperty(exports, "PUT", { enumerable: true, get: function () { return apiHandler_1.PUT; } });
Object.defineProperty(exports, "handleRequest", { enumerable: true, get: function () { return apiHandler_1.handleRequest; } });
var ApiDataFactory_1 = require("./jsonApi/factories/ApiDataFactory");
Object.defineProperty(exports, "ApiDataFactory", { enumerable: true, get: function () { return ApiDataFactory_1.ApiDataFactory; } });
var JsonApiDataFactory_1 = require("./jsonApi/factories/JsonApiDataFactory");
Object.defineProperty(exports, "JsonApiDataFactory", { enumerable: true, get: function () { return JsonApiDataFactory_1.JsonApiDataFactory; } });
var RehydrationFactory_1 = require("./jsonApi/factories/RehydrationFactory");
Object.defineProperty(exports, "RehydrationFactory", { enumerable: true, get: function () { return RehydrationFactory_1.RehydrationFactory; } });
//# sourceMappingURL=index.js.map