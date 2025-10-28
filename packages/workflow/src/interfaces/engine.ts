import { IDataObject } from "./data";
import { NodeConnectionType } from "./node";
import { ITaskData } from "./task";

/**
 * Represents a request to execute a specific node and receive the result back.
 * This action tells the engine to execute the specified node with the provided input
 * and then call back the requesting node with the execution result.
 *
 * @template T - The type of metadata associated with this action
 */
type ExecuteNodeAction<T> = {
	/** The type identifier for this action */
	actionType: 'ExecutionNodeAction';
	/** The name of the node to be executed */
	nodeName: string;
	/** Input data to be passed to the node for execution */
	input: IDataObject;
	/** The type of connection this execution request uses */
	type: NodeConnectionType;
	/** Unique identifier for this execution request */
	id: string;
	/** Additional metadata for this execution request */
	metadata: T;
};

/**
 * Union type of all possible actions that nodes can request from the workflow engine.
 * Currently only contains ExecuteNodeAction, but will be extended with additional
 * action types as they are implemented.
 *
 * @template T - The type of metadata associated with this action
 */
type EngineAction<T = unknown> = ExecuteNodeAction<T>;

/**
 * A collection of actions that a node wants the engine to fulfill and call back with results.
 * The requesting node sends this to the engine and expects to receive an EngineResponse
 * containing the results of all requested actions.
 *
 * @template T - The type of metadata associated with this request
 *
 * @todo This should use `unknown`, but jest-mock-extended will turn this into
 * `Partial<unknown>` which `unknown` cannot be assigned to, which leads to a
 * lot of type errors in our tests.
 * The correct fix is to make a PR to jest-mock-extended and make it handle
 * `unknown` special, turning it into `unknown` instead of `Partial<unknown>`.
 */
export type EngineRequest<T = object> = {
	/** Array of actions that the requesting node wants the engine to fulfill */
	actions: Array<EngineAction<T>>;
	/** Metadata associated with this request */
	metadata: T;
};

/**
 * Result of executing a single node action within the workflow engine.
 * Contains the original action and the resulting task data.
 *
 * @template T - The type of metadata associated with this result
 */
export type ExecuteNodeResult<T = unknown> = {
	/** The action that was executed */
	action: ExecuteNodeAction<T>;
	/** The resulting task data from the execution */
	data: ITaskData;
};

/**
 * Union type of all possible results from engine actions.
 * Currently only contains ExecuteNodeResult, but will be extended with additional
 * result types as new action types are implemented.
 *
 * @template T - The type of metadata associated with this result
 */
type EngineResult<T> = ExecuteNodeResult<T>;

/**
 * Response structure returned from the workflow engine after execution.
 * Contains the results of all executed actions along with associated metadata.
 *
 * @template T - The type of metadata associated with this response
 */
export type EngineResponse<T = unknown> = {
	/** Array of results from each executed action */
	actionResponses: Array<EngineResult<T>>;
	/** Metadata associated with this response */
	metadata: T;
};