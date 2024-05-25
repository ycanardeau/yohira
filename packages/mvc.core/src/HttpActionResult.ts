import { ActionContext, IResult } from '@yohira/mvc.abstractions';

import { ActionResult } from './ActionResult';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/HttpActionResult.cs,da90aa64087eee48,references
/**
 * An {@link ActionResult} that when executed will produce a response based on the {@link IResult} provided.
 */
export class HttpActionResult extends ActionResult {
	/**
	 * Initializes a new instance of the <see cref="HttpActionResult"/> class with the
	 * {@link IResult} provided.
	 * @param result The {@link IResult} instance to be used during the {@link executeResult} invocation.
	 */
	constructor(
		/**
		 * Gets the instance of the current {@link IResult}.
		 */
		readonly result: IResult,
	) {
		super();
	}

	executeResult(context: ActionContext): Promise<void> {
		return this.result.execute(context.httpContext);
	}
}
