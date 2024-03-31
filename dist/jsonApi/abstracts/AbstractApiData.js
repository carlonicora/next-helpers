"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractApiData = void 0;
const RehydrationFactory_1 = require("../factories/RehydrationFactory");
class AbstractApiData {
    get id() {
        if (!this._id)
            throw new Error("Grocery ID is not set.");
        return this._id;
    }
    get self() {
        return this._self;
    }
    get createdAt() {
        throw new Error("Method not implemented.");
    }
    get updatedAt() {
        throw new Error("Method not implemented.");
    }
    get included() {
        return this._included ?? [];
    }
    ingestJsonApi(data) { }
    _readIncluded(data, type, dataType) {
        if (data.included === undefined ||
            data.included.length === 0 ||
            data.jsonApi.relationships === undefined ||
            data.jsonApi.relationships[type] === undefined ||
            data.jsonApi.relationships[type].data === undefined)
            return [];
        if (Array.isArray(data.jsonApi.relationships[type].data)) {
            const response = data.jsonApi.relationships[type].data.map((jsonApiData) => {
                const includedData = data.included.find((includedData) => includedData.id === jsonApiData.id && includedData.type === jsonApiData.type);
                if (includedData === undefined)
                    return undefined;
                return RehydrationFactory_1.RehydrationFactory.rehydrate(dataType, { jsonApi: includedData, included: data.included });
            });
            return response.filter((item) => item !== undefined);
        }
        const includedData = data.included.find((includedData) => includedData.id === data.jsonApi.relationships[type].data.id &&
            includedData.type === data.jsonApi.relationships[type].data.type);
        return RehydrationFactory_1.RehydrationFactory.rehydrate(dataType, { jsonApi: includedData, included: data.included });
    }
    dehydrate() {
        return {
            jsonApi: this._jsonApi,
            included: this._included ?? [],
        };
    }
    rehydrate(data) {
        this._jsonApi = data.jsonApi;
        this._included = data.included;
        this._id = this._jsonApi.id;
        this._createdAt = this._jsonApi.meta.createdAt !== undefined ? new Date(this._jsonApi.meta.createdAt) : undefined;
        this._updatedAt = this._jsonApi.meta.updatedAt !== undefined ? new Date(this._jsonApi.meta.updatedAt) : undefined;
        this._self = this._jsonApi.links?.self ?? undefined;
        return this;
    }
}
exports.AbstractApiData = AbstractApiData;
//# sourceMappingURL=AbstractApiData.js.map