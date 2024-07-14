"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RehydrationFactory = void 0;
const DataClass_1 = require("../../DataClass");
class RehydrationFactory {
    static rehydrate(classKey, data) {
        const factoryClass = DataClass_1.DataClass.get(classKey);
        const instance = new factoryClass();
        return instance.rehydrate(data);
    }
    static rehydrateList(classKey, data) {
        const factoryClass = DataClass_1.DataClass.get(classKey);
        const response = data.map((item) => {
            const instance = new factoryClass();
            return instance.rehydrate(item);
        });
        return response;
    }
}
exports.RehydrationFactory = RehydrationFactory;
//# sourceMappingURL=RehydrationFactory.js.map