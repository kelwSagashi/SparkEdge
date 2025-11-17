import type { IRunExecutionData } from "./data";
import type { ExecutionStatus } from "./execution";
import type { WorkflowExecuteMode } from "./workflow";

export interface IRun {
	data: IRunExecutionData;
	mode: WorkflowExecuteMode;
	waitTill?: Date | null;
	startedAt: Date;
	stoppedAt?: Date;
	status: ExecutionStatus;

	/** ID of the job this execution belongs to. Only in scaling mode. */
	jobId?: string;
}