import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';

import { ActionResult } from './ActionResult';
import { IActionResultExecutor } from './infrastructure/IActionResultExecutor';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/RedirectResult.cs,db269b27e09c6630,references
/**
 * An {@link ActionResult} that returns a Found (302), Moved Permanently (301), Temporary Redirect (307),
 * or Permanent Redirect (308) response with a Location header to the supplied URL.
 */
export class RedirectResult extends ActionResult {
	constructor(
		/**
		 * Gets or sets the URL to redirect to.
		 */
		public url: string,
		/**
		 * Gets or sets the value that specifies that the redirect should be permanent if true or temporary if false.
		 */
		public permanent: boolean,
		/**
		 * Gets or sets an indication that the redirect preserves the initial request method.
		 */
		public preserveMethod: boolean,
	) {
		super();
	}

	executeResult(context: ActionContext): Promise<void> {
		const executor = getRequiredService<
			IActionResultExecutor<RedirectResult>
		>(
			context.httpContext.requestServices,
			Symbol.for('IActionResultExecutor<RedirectResult>'),
		);
		return executor.execute(context, this);
	}
}
