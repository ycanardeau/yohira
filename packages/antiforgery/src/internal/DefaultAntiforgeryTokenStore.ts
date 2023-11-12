import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { IOptions } from '@yohira/extensions.options';
import { IHttpContext } from '@yohira/http.abstractions';

import { AntiforgeryOptions } from '../AntiforgeryOptions';
import { AntiforgeryTokenSet } from '../AntiforgeryTokenSet';
import { IAntiforgeryTokenStore } from './IAntiforgeryTokenStore';

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/DefaultAntiforgeryTokenStore.cs,eeda11db455df78b,references
export class DefaultAntiforgeryTokenStore implements IAntiforgeryTokenStore {
	private readonly options: AntiforgeryOptions;

	constructor(
		@inject(Symbol.for('IOptions<AntiforgeryOptions>'))
		optionsAccessor: IOptions<AntiforgeryOptions>,
	) {
		this.options = optionsAccessor.getValue(AntiforgeryOptions);
	}

	getCookieToken(httpContext: IHttpContext): string | undefined {
		if (httpContext === undefined) {
			throw new Error('Assertion failed.');
		}

		const requestCookie = httpContext.request.cookies.get(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.options.cookie.name!,
		);
		if (!requestCookie) {
			// unable to find the cookie.
			return undefined;
		}

		return requestCookie;
	}

	getRequestTokens(httpContext: IHttpContext): Promise<AntiforgeryTokenSet> {
		// TODO
		throw new Error('Method not implemented.');
	}

	saveCookieToken(httpContext: IHttpContext, token: string): void {
		if (httpContext === undefined) {
			throw new Error('Assertion failed.');
		}
		if (token === undefined) {
			throw new Error('Assertion failed.');
		}

		const options = this.options.cookie.build(httpContext);

		if (this.options.cookie.path !== undefined) {
			options.path = this.options.cookie.path;
		} else {
			const pathBase = httpContext.request.pathBase.toString();
			if (!!pathBase) {
				options.path = pathBase;
			}
		}

		httpContext.response.cookies.append(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.options.cookie.name!,
			token,
			options,
		);
	}
}
