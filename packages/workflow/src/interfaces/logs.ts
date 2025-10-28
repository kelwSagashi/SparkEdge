import { LOG_LEVELS, LOG_SCOPES } from "../constants";

export type LogScope = (typeof LOG_SCOPES)[number];

export type LogLevel = (typeof LOG_LEVELS)[number];
export type LogMetadata = {
	[key: string]: unknown;
	scopes?: LogScope[];
	file?: string;
	function?: string;
};
export type Logger = Record<
	Exclude<LogLevel, 'silent'>,
	(message: string, metadata?: LogMetadata) => void
>;