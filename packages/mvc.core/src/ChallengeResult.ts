import {
	AuthenticationProperties,
	challenge,
} from '@yohira/authentication.abstractions';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';

import { ActionResult } from './ActionResult';

function logChallengeResultExecuting(logger: ILogger, schemes: string[]): void {
	if (logger.isEnabled(LogLevel.Information)) {
		logger.log(
			LogLevel.Information,
			`Executing ChallengeResult with authentication schemes (${schemes}).`,
		);
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/ChallengeResult.cs,69cb47743171da71,references
/**
 * An {@link ActionResult} that on execution invokes {@link challenge}.
 */
export class ChallengeResult extends ActionResult {
	/**
	 * Initializes a new instance of {@link ChallengeResult} with the
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
		const logger = loggerFactory.createLogger(ChallengeResult.name);
		logChallengeResultExecuting(logger, this.authenticationSchemes);

		if (
			this.authenticationSchemes !== undefined &&
			this.authenticationSchemes.length > 0
		) {
			for (const scheme of this.authenticationSchemes) {
				await challenge(httpContext, scheme, this.properties);
			}
		} else {
			await challenge(httpContext, undefined, this.properties);
		}
	}
}
