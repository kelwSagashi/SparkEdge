import type { IExecuteResponsePromiseData } from "./data";
import type { IDeferredPromise } from "./deferred-promise";
import type { FunctionsBaseWithRequiredKeys } from "./functions";
import type { IGetNodeParameterOptions, INodeExecutionData, NodeParameterValueType } from "./node";
import type { IRun } from "./run";
import type { CloseFunction } from "./utils";

export type TriggerPanelDefinition = {
	hideContent?: boolean | string;
	header?: string;
	executionsHelp?: string | { active: string; inactive: string };
	activationHint?: string | { active: string; inactive: string };
};

export interface ITriggerFunctions
	extends FunctionsBaseWithRequiredKeys<'getMode' | 'getActivationMode'> {
	emit(
		data: INodeExecutionData[][],
		responsePromise?: IDeferredPromise<IExecuteResponsePromiseData>,
		donePromise?: IDeferredPromise<IRun>,
	): void;
	emitError(error: Error, responsePromise?: IDeferredPromise<IExecuteResponsePromiseData>): void;
	getNodeParameter(
		parameterName: string,
		fallbackValue?: any,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType | object;
	// helpers: RequestHelperFunctions &
	// 	BaseHelperFunctions &
	// 	BinaryHelperFunctions &
	// 	SSHTunnelFunctions &
	// 	SchedulingFunctions;
}

export interface ITriggerResponse {
	closeFunction?: CloseFunction;
	// To manually trigger the run
	manualTriggerFunction?: () => Promise<void>;
	// Gets added automatically at manual workflow runs resolves with
	// the first emitted data
	manualTriggerResponse?: Promise<INodeExecutionData[][]>;
}