import { ContextTypeValues } from "../constants";

export type ContextType = (typeof ContextTypeValues)[keyof typeof ContextTypeValues];

export type IContextObject = {
	[key: string]: any;
};