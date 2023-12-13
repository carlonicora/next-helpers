export declare class ApiError extends Error {
    code?: number;
    constructor(message?: string, code?: number);
    get message(): string;
}
