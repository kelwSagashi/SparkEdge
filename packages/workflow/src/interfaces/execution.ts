import { ExecutionStatusList } from "../constants";
import { GenericError } from "../errors/generic-error";
import { INode, INodeExecutionData } from "./node";
import { ITaskDataConnections, ITaskDataConnectionsSource, ITaskMetadata } from "./task";

export type ExecutionStatus = (typeof ExecutionStatusList)[number];


export interface RelatedExecution {
	executionId: string;
	workflowId: string;
	// In the case of a parent execution, whether the parent should be resumed when the sub execution finishes.
	shouldResume?: boolean;
}

export type ExecutionError = GenericError;