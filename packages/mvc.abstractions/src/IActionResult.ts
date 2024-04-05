import { ActionContext } from './ActionContext';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Abstractions/IActionResult.cs,4c3b5c8150937c35,references
/**
 * Defines a contract that represents the result of an action method.
 */
export interface IActionResult {
	/**
	 * Executes the result operation of the action method asynchronously. This method is called by MVC to process
	 * the result of an action method.
	 * @param context The context in which the result is executed. The context information includes
	 * information about the action that was executed and request information.
	 * @returns A task that represents the asynchronous execute operation.
	 */
	executeResult(context: ActionContext): Promise<void>;
}
