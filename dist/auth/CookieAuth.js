"use strict";
"use server";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToken = void 0;
const headers_1 = require("next/headers");
async function updateToken(params) {
    (0, headers_1.cookies)().set({
        name: "token",
        value: params.token,
        httpOnly: true,
        path: "/",
    });
    (0, headers_1.cookies)().set({
        name: "refreshToken",
        value: params.refreshToken,
        httpOnly: true,
        path: "/",
    });
}
exports.updateToken = updateToken;
//# sourceMappingURL=CookieAuth.js.map