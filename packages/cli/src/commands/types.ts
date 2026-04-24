import { Constructable } from "@spark-edge/di";


export type CommandOptions = {
	name: string;
	description: string;
	examples?: string[];
};

export type ICommand = {
	flags?: object;
	init?: () => Promise<void>;
	run: (args?: any) => Promise<void>;
	catch?: (e: Error) => Promise<void>;
	finally?: (e?: Error) => Promise<void>;
};

export type CommandClass = Constructable<ICommand>;

export type CommandEntry = {
	class: CommandClass;
	description: string;
	examples?: string[];
};

