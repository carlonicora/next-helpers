"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "ApiError";
    }
    get message() {
        return this.message ?? "";
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=ApiError.js.map