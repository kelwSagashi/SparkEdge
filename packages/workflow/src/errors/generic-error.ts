import type { INodeData } from "../interfaces/node";

export class GenericError extends Error {
    declare type: string | undefined;
    constructor(
        node: INodeData,
        error: Error | string,

    ) {
        if (error instanceof GenericError) {
            return error;
        }
        let _error_message = "";
        let _cause: unknown;
        if (typeof error === "string") _error_message = error;
        else if (error instanceof Error) {
            _error_message = error.message;
            _cause = error.cause ?? "?";
        }
        super(_error_message, {
            cause: _cause
        })

        this.type = "generic";
    }
}