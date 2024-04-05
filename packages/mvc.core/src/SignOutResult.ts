import {
	AuthenticationProperties,
	signOut,
} from '@yohira/authentication.abstractions';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';
import { ActionContext, IResult } from '@yohira/mvc.abstractions';

import { ActionResult } from './ActionResult';

function logSignOutResultExecuting(logger: ILogger, schemes: string[]): void {
	if (logger.isEnabled(LogLevel.Information)) {
		logger.log(
			LogLevel.Information,
			`Executing ${SignOutResult.name} with authentication schemes ({${schemes}}).`,
		);
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/SignOutResult.cs,44d10fda92fbe84c,references
/**
 * An {@link ActionResult} that on execution invokes {@link signOut}.
 */
export class SignOutResult extends ActionResult implements IResult {
	/**
	 * Initializes a new instance of {@link SignOutResult} with the
	 * specified authentication schemes and {@link properties}.
	 * @param authenticationSchemes The authentication schemes to use when signing out the user.
	 * @param properties {@link AuthenticationProperties} used to perform the sign-out operation.
	 */
	constructor(
		/**
		 * Gets or sets the authentication schemes that are challenged.
		 */
		public authenticationSchemes: string[],
		/**
		 * Gets or sets the {@link AuthenticationProperties} used to perform the sign-out operation.
		 */
		public properties: AuthenticationProperties | undefined,
	) {
		super();
	}

	private async executeCore(httpContext: IHttpContext): Promise<void> {
		const loggerFactory = getRequiredService<ILoggerFactory>(
			httpContext.requestServices,
			ILoggerFactory,
		);
		const logger = loggerFactory.createLogger(SignOutResult.name);
		logSignOutResultExecuting(logger, this.authenticationSchemes);

		if (this.authenticationSchemes.length === 0) {
			await signOut(httpContext, undefined, this.properties);
		} else {
			for (const authenticationScheme of this.authenticationSchemes) {
				await signOut(
					httpContext,
					authenticationScheme,
					this.properties,
				);
			}
		}
	}

	execute(httpContext: IHttpContext): Promise<void> {
		return this.executeCore(httpContext);
	}

	executeResult(context: ActionContext): Promise<void> {
		return this.execute(context.httpContext);
	}
}
