"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonApiDataFactory = void 0;
const ApiDataFactory_1 = require("./ApiDataFactory");
class JsonApiDataFactory {
    static create(classKey, data) {
        const factoryClass = ApiDataFactory_1.ApiDataFactory.classMap.get(typeof classKey === "string" ? classKey : classKey.name);
        if (!factoryClass)
            throw new Error(`Class not registered for key: ${typeof classKey === "string" ? classKey : classKey.name}`);
        const instance = new factoryClass();
        return instance.createJsonApi(data);
    }
}
exports.JsonApiDataFactory = JsonApiDataFactory;
//# sourceMappingURL=JsonApiDataFactory.js.map