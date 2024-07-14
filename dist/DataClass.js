"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataClass = void 0;
class DataClass {
    static registerObjectClass(key, classConstructor) {
        const classKey = key.name;
        if (!this._map.has(classKey))
            this._map.set(classKey, classConstructor);
    }
    static get(classKey) {
        const response = this._map.get(classKey.name);
        if (!response)
            throw new Error(`Class not registered for key: ${typeof classKey === "string" ? classKey : classKey.name}`);
        return response;
    }
}
exports.DataClass = DataClass;
DataClass._map = new Map();
//# sourceMappingURL=DataClass.js.map