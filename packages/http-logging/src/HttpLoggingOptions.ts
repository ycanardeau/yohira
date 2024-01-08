import { HeaderNames } from '@yohira/http.headers';

import { HttpLoggingFields } from './HttpLoggingFields';

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingOptions.cs,66de408e1455606c,references
export class HttpLoggingOptions {
	/**
	 * Fields to log for the Request and Response. Defaults to logging request and response properties and headers.
	 */
	loggingFields =
		HttpLoggingFields.RequestPropertiesAndHeaders |
		HttpLoggingFields.ResponsePropertiesAndHeaders;

	/**
	 * Request header values that are allowed to be logged.
	 *
	 * If a request header is not present in the {@link requestHeaders},
	 * the header name will be logged with a redacted value.
	 * Request headers can contain authentication tokens,
	 * or private information which may have regulatory concerns
	 * under GDPR and other laws. Arbitrary request headers
	 * should not be logged unless logs are secure and
	 * access controlled and the privacy impact assessed.
	 */
	requestHeaders: readonly HeaderNames[] = [
		HeaderNames.Accept,
		HeaderNames['Accept-Charset'],
		HeaderNames['Accept-Encoding'],
		HeaderNames['Accept-Language'],
		HeaderNames.Allow,
		HeaderNames['Cache-Control'],
		HeaderNames.Connection,
		HeaderNames['Content-Encoding'],
		HeaderNames['Content-Length'],
		HeaderNames['Content-Type'],
		HeaderNames.Date,
		HeaderNames.DNT,
		HeaderNames.Expect,
		HeaderNames.Host,
		HeaderNames['Max-Forwards'],
		HeaderNames.Range,
		HeaderNames['Sec-WebSocket-Extensions'],
		HeaderNames['Sec-WebSocket-Version'],
		HeaderNames.TE,
		HeaderNames.Trailer,
		HeaderNames['Transfer-Encoding'],
		HeaderNames.Upgrade,
		HeaderNames['User-Agent'],
		HeaderNames.Warning,
		HeaderNames['X-Requested-With'],
		HeaderNames['X-UA-Compatible'],
	] as const;

	/**
	 * Response header values that are allowed to be logged.
	 *
	 * If a response header is not present in the {@link responseHeaders},
	 * the header name will be logged with a redacted value.
	 */
	responseHeaders: readonly HeaderNames[] = [
		HeaderNames['Accept-Ranges'],
		HeaderNames.Age,
		HeaderNames.Allow,
		HeaderNames['Alt-Svc'],
		HeaderNames.Connection,
		HeaderNames['Content-Disposition'],
		HeaderNames['Content-Language'],
		HeaderNames['Content-Length'],
		HeaderNames['Content-Location'],
		HeaderNames['Content-Range'],
		HeaderNames['Content-Type'],
		HeaderNames.Date,
		HeaderNames.Expires,
		HeaderNames['Last-Modified'],
		HeaderNames.Location,
		HeaderNames.Server,
		HeaderNames['Transfer-Encoding'],
		HeaderNames.Upgrade,
		HeaderNames['X-Powered-By'],
	] as const;
}
