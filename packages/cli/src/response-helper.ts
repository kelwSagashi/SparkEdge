
import type { Request, Response } from 'express';
import { Readable } from 'node:stream';

export function sendSuccessResponse<T>(
	res: Response,
	data: T,
	raw?: boolean,
	responseCode?: number,
	responseHeader?: object,
) {
	if (responseCode !== undefined) {
		res.status(responseCode);
	}

	if (responseHeader) {
		res.header(responseHeader);
	}

	if (data instanceof Readable) {
		data.pipe(res);
		return;
	}

	if (raw === true) {
		if (typeof data === 'string') {
			res.send(data);
		} else {
			res.json({...data});
		}
	} else {
		res.json({
			...data
		});
	}
}

function isResponseError(error: Error) {

	if (error instanceof Error) {
		return (
			'httpStatusCode' in error &&
			typeof error.httpStatusCode === 'number' &&
			'errorCode' in error &&
			typeof error.errorCode === 'number'
		);
	}

	return false;
}

interface ErrorResponse {
	code: number;
	message: string;
	hint?: string;
	stacktrace?: string;
	meta?: Record<string, unknown>;
}

export function sendErrorResponse(res: Response, error: Error) {
	let httpStatusCode = 500;

	const response: ErrorResponse = {
		code: 0,
		message: error.message ?? 'Unknown error',
	};

	res.status(httpStatusCode).json(response);
}

export const isUniqueConstraintError = (error: Error) =>
	['unique', 'duplicate'].some((s) => error.message.toLowerCase().includes(s));

export function reportError(
    // error: Error
) {
	// if (!(error instanceof ResponseError) || error.httpStatusCode > 404) {
	// 	Container.get(ErrorReporter).error(error);
	// }
}

export function send<T, R extends Request, S extends Response>(
	processFunction: (req: R, res: S) => Promise<T>,
	raw = false,
) {
	return async (req: R, res: S): Promise<void> => {
		try {
			const data = await processFunction(req, res);

			if (!res.headersSent) sendSuccessResponse(res, data, raw);
		} catch (error) {
			if (error instanceof Error) {
				// reportError(error);

				if (isUniqueConstraintError(error)) {
					error.message = 'There is already an entry with this name';
				}
			}

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			sendErrorResponse(res, error);
		}
	};
}

