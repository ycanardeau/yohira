import {
	AuthenticationProperties,
	forbid,
} from '@yohira/authentication.abstractions';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';

import { ActionResult } from './ActionResult';

function logForbidResultExecuting(logger: ILogger, schemes: string[]): void {
	if (logger.isEnabled(LogLevel.Information)) {
		logger.log(
			LogLevel.Information,
			`Executing {nameof(ForbidResult)} with authentication schemes ({${schemes}}).`,
		);
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/ForbidResult.cs,8243e52db809342d,references
/**
 * An {@link ActionResult} that on execution invokes {@link forbid}.
 */
export class ForbidResult extends ActionResult {
	/**
	 * Initializes a new instance of {@link ForbidResult} with the
	 * specified authentication schemes and {@link properties}.
	 * @param authenticationSchemes The authentication schemes to challenge.
	 * @param properties {@link AuthenticationProperties} used to perform the authentication
	 * challenge.
	 */
	constructor(
		/**
		 * Gets or sets the authentication schemes that are challenged.
		 */
		public authenticationSchemes: string[],
		/**
		 * Gets or sets the {@link AuthenticationProperties} used to perform the authentication challenge.
		 */
		public properties: AuthenticationProperties | undefined,
	) {
		super();
	}

	async executeResult(context: ActionContext): Promise<void> {
		const httpContext = context.httpContext;

		const loggerFactory = getRequiredService<ILoggerFactory>(
			httpContext.requestServices,
			ILoggerFactory,
		);
		const logger = loggerFactory.createLogger(ForbidResult.name);
		logForbidResultExecuting(logger, this.authenticationSchemes);

		if (
			this.authenticationSchemes !== undefined &&
			this.authenticationSchemes.length > 0
		) {
			for (const authenticationScheme of this.authenticationSchemes) {
				await forbid(
					httpContext,
					authenticationScheme,
					this.properties,
				);
			}
		} else {
			await forbid(httpContext, undefined, this.properties);
		}
	}
}
