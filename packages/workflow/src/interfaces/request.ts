import type express from 'express';

export type APIRequest<
	RouteParams = {},
	ResponseBody = {},
	RequestBody = {},
	RequestQuery = {},
> = express.Request<RouteParams, ResponseBody, RequestBody, RequestQuery> & {
	browserId?: string;
};

export type AuthenticatedRequest<
	RouteParams = {},
	ResponseBody = {},
	RequestBody = {},
	RequestQuery = {},
> = Omit<APIRequest<RouteParams, ResponseBody, RequestBody, RequestQuery>, 'user' | 'cookies'> & {
	user: {};
	cookies: Record<string, string | undefined>;
	headers: express.Request['headers'];
};