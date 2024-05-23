import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { StatusCodes } from '@yohira/http.abstractions';
import { HeaderNames } from '@yohira/http.headers';
import { ActionContext } from '@yohira/mvc.abstractions';

import { RedirectResult } from '../RedirectResult';
import { IActionResultExecutor } from './IActionResultExecutor';

function logRedirectResultExecuting(
	logger: ILogger,
	destination: string,
): void {
	logger.log(
		LogLevel.Information,
		`Executing RedirectResult, redirecting to ${destination}.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/Infrastructure/RedirectResultExecutor.cs,2de50c2beff1e3bc,references
export class RedirectResultExecutor
	implements IActionResultExecutor<RedirectResult>
{
	private readonly logger: ILogger;

	constructor(@inject(ILoggerFactory) loggerFactory: ILoggerFactory) {
		this.logger = loggerFactory.createLogger(RedirectResultExecutor.name);
	}

	execute(context: ActionContext, result: RedirectResult): Promise<void> {
		// TODO: const urlHelper = result.urlHelper ?? this.urlHelperFactory.getUrlHelper(context);

		// isLocalUrl is called to handle URLs starting with '~/'.
		const destinationUrl = result.url;
		/* TODO: if (urlHelper.isLocalUrl(destinationUrl)) {
			destinationUrl = urlHelper.content(result.url);
		} */

		logRedirectResultExecuting(this.logger, destinationUrl);

		if (result.preserveMethod) {
			context.httpContext.response.statusCode = result.permanent
				? StatusCodes.Status308PermanentRedirect
				: StatusCodes.Status307TemporaryRedirect;
			context.httpContext.response.headers.setHeader(
				HeaderNames.Location,
				destinationUrl,
			);
		} else {
			context.httpContext.response.redirect(
				destinationUrl,
				result.permanent,
			);
		}

		return Promise.resolve();
	}
}
