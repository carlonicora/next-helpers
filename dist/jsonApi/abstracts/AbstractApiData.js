"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractApiData = void 0;
class AbstractApiData {
    get included() {
        throw new Error("Method not implemented.");
    }
    get id() {
        if (!this._id)
            throw new Error("Grocery ID is not set.");
        return this._id;
    }
    get self() {
        return this._self;
    }
    ingestJsonApi(data) { }
    _readIncluded(data, type, factory) {
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
                const object = factory();
                object.rehydrate({ jsonApi: includedData, included: data.included });
                return object;
            });
            return response.filter((item) => item !== undefined);
        }
        const includedData = data.included.find((includedData) => includedData.id === data.jsonApi.relationships[type].data.id &&
            includedData.type === data.jsonApi.relationships[type].data.type);
        const object = factory();
        object.rehydrate({ jsonApi: includedData, included: data.included });
        return object;
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
        this._self = this._jsonApi.links?.self ?? undefined;
        return this;
    }
}
exports.AbstractApiData = AbstractApiData;
//# sourceMappingURL=AbstractApiData.js.map