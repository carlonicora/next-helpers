"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RehydrationFactory = void 0;
const ApiDataFactory_1 = require("./ApiDataFactory");
class RehydrationFactory {
    static rehydrate(classKey, data) {
        const factoryClass = ApiDataFactory_1.ApiDataFactory.classMap.get(classKey);
        if (!factoryClass)
            throw new Error(`Class not registered for key: ${classKey}`);
        const instance = new factoryClass();
        return instance.rehydrate(data);
    }
    static rehydrateList(classKey, data) {
        const factoryClass = ApiDataFactory_1.ApiDataFactory.classMap.get(classKey);
        if (!factoryClass)
            throw new Error(`Class not registered for key: ${classKey}`);
        const response = data.map((item) => {
            const instance = new factoryClass();
            return instance.rehydrate(item);
        });
        return response;
    }
}
exports.RehydrationFactory = RehydrationFactory;
//# sourceMappingURL=RehydrationFactory.js.map