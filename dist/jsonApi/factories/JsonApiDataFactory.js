"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonApiDataFactory = void 0;
const DataClass_1 = require("../../DataClass");
class JsonApiDataFactory {
    static create(classKey, data) {
        const factoryClass = DataClass_1.DataClass.get(classKey);
        const instance = new factoryClass();
        return instance.createJsonApi(data);
    }
}
exports.JsonApiDataFactory = JsonApiDataFactory;
//# sourceMappingURL=JsonApiDataFactory.js.map