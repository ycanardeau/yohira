import { ActionContext, IActionResult } from '@yohira/mvc.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/ActionResult.cs,5c2548bb3f42589d,references
/**
 * A default implementation of {@link IActionResult}.
 */
export abstract class ActionResult implements IActionResult {
	/**
	 * Executes the result operation of the action method synchronously. This method is called by MVC to process
	 * the result of an action method.
	 * @param context The context in which the result is executed. The context information includes
	 * information about the action that was executed and request information.
	 */
	executeResultSync(context: ActionContext): void {}

	/**
	 * Executes the result operation of the action method asynchronously. This method is called by MVC to process
	 * the result of an action method.
	 * The default implementation of this method calls the <see cref="ExecuteResult(ActionContext)"/> method and
	 * returns a completed task.
	 * @param context The context in which the result is executed. The context information includes
	 * information about the action that was executed and request information.
	 * @returns A task that represents the asynchronous execute operation.
	 */
	executeResult(context: ActionContext): Promise<void> {
		this.executeResultSync(context);
		return Promise.resolve();
	}
}
