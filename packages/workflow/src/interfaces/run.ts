import type { IRunExecutionData } from "./data";
import type { ExecutionStatus } from "./execution";
import type { INodeExecutionData } from "./node";
import type { WorkflowExecuteMode } from "./workflow";

export type IRun = {
	// data: IRunExecutionData;
	data: {[k: string]: INodeExecutionData;};
	mode: WorkflowExecuteMode;
	waitTill?: Date | null;
	startedAt: Date;
	stoppedAt?: Date;
	status: ExecutionStatus;

	/** ID of the job this execution belongs to. Only in scaling mode. */
	jobId?: string;
}