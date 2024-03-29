import { escapeDataString } from '@yohira/base';
import {
	IFeatureCollection,
	getRequiredFeature,
} from '@yohira/extensions.features';
import {
	ILogger,
	ILoggerT,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { StringValues } from '@yohira/extensions.primitives';
import {
	CookieOptions,
	IHttpResponseFeature,
	IResponseCookies,
	IResponseHeaderDictionary,
	IServiceProvidersFeature,
} from '@yohira/http.features';
import { HeaderNames } from '@yohira/http.headers';
import { SameSiteMode } from '@yohira/http.shared';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/ResponseCookies.cs,e208c05fbe0b89cd,references
function logSameSiteCookieNotSecure(logger: ILogger, name: string): void {
	logger.log(
		LogLevel.Warning,
		`The cookie '${name}' has set 'SameSite=None' and must also set 'Secure'.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/ResponseCookies.cs,8029ad80fcd25000,references
/**
 * A wrapper for the response Set-Cookie header.
 */
export class ResponseCookies implements IResponseCookies {
	private logger: ILogger | undefined;

	private headers: IResponseHeaderDictionary;

	constructor(private readonly features: IFeatureCollection) {
		this.headers = getRequiredFeature<IHttpResponseFeature>(
			this.features,
			IHttpResponseFeature,
		).responseHeaders;
	}

	append(key: string, value: string, options: CookieOptions): void {
		// SameSite=None cookies must be marked as Secure.
		if (!options.secure && options.sameSite === SameSiteMode.None) {
			if (this.logger === undefined) {
				const services = this.features.get<IServiceProvidersFeature>(
					IServiceProvidersFeature,
				)?.requestServices;
				this.logger = services?.getService<ILoggerT<ResponseCookies>>(
					Symbol.for('ILoggerT<ResponseCookies>'),
				);
			}

			if (this.logger !== undefined) {
				logSameSiteCookieNotSecure(this.logger, key);
			}
		}

		const cookie = options
			.createCookieHeader(key, escapeDataString(value))
			.toString();
		this.headers.setHeader(
			HeaderNames['Set-Cookie'],
			StringValues.concat(
				new StringValues(
					this.headers.getHeader(HeaderNames['Set-Cookie']) as
						| string
						| string[] /* REVIEW */,
				),
				new StringValues(cookie),
			).toArray() as string[],
		);
	}

	delete(key: string, options?: CookieOptions | undefined): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
