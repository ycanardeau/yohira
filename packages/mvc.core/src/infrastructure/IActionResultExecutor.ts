import { ActionContext, IActionResult } from '@yohira/mvc.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/Infrastructure/IActionResultExecutor.cs,8369d84d423ab740,references
export interface IActionResultExecutor<TResult> extends IActionResult {
	/**
	 * Asynchronously executes the action result, by modifying the {@link IHttpResponse}.
	 * @param context The {@link ActionContext} associated with the current request.
	 * @param result The action result to execute.
	 * @returns A {@link Promise} which represents the asynchronous operation.
	 */
	execute(context: ActionContext, result: TResult): Promise<void>;
}
