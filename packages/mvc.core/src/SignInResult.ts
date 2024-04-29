import {
	AuthenticationProperties,
	signIn,
} from '@yohira/authentication.abstractions';
import { ClaimsPrincipal } from '@yohira/base';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';

import { ActionResult } from './ActionResult';

function logSignInResultExecuting(
	logger: ILogger,
	scheme: string | undefined,
	principal: ClaimsPrincipal,
): void {
	logger.log(
		LogLevel.Information,
		`Executing ${SignInResult.name} with authentication scheme ({${scheme}}) and the following principal: {${principal}}.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/SignInResult.cs,05d7850964bb69fd,references
/**
 * An {@link ActionResult} that on execution invokes {@link signIn}.
 */
export class SignInResult extends ActionResult {
	/**
	 * Initializes a new instance of {@link SignInResult} with the
	 * specified authentication scheme and {@link properties}.
	 * @param authenticationScheme The authentication schemes to use when signing in the user.
	 * @param principal The claims principal containing the user claims.
	 * @param properties {@link AuthenticationProperties} used to perform the sign-in operation.
	 */
	constructor(
		/**
		 * Gets or sets the authentication scheme that is used to perform the sign-in operation.
		 */
		public authenticationScheme: string | undefined,
		/**
		 * Gets or sets the {@link ClaimsPrincipal} containing the user claims.
		 */
		public principal: ClaimsPrincipal,
		/**
		 * Gets or sets the {@link AuthenticationProperties} used to perform the sign-in operation.
		 */
		public properties: AuthenticationProperties | undefined,
	) {
		super();
	}

	executeResult(context: ActionContext): Promise<void> {
		const httpContext = context.httpContext;
		const loggerFactory = getRequiredService<ILoggerFactory>(
			httpContext.requestServices,
			ILoggerFactory,
		);
		const logger = loggerFactory.createLogger(SignInResult.name);
		logSignInResultExecuting(
			logger,
			this.authenticationScheme,
			this.principal,
		);

		return signIn(
			httpContext,
			this.authenticationScheme,
			this.principal,
			this.properties,
		);
	}
}
