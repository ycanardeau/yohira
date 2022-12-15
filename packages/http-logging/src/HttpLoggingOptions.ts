import { HeaderNames } from '@yohira/http';

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
	requestHeaders: readonly typeof HeaderNames[number][] = [
		'Accept',
		'Accept-Charset',
		'Accept-Encoding',
		'Accept-Language',
		'Allow',
		'Cache-Control',
		'Connection',
		'Content-Encoding',
		'Content-Length',
		'Content-Type',
		'Date',
		'DNT',
		'Expect',
		'Host',
		'Max-Forwards',
		'Range',
		'Sec-WebSocket-Extensions',
		'Sec-WebSocket-Version',
		'TE',
		'Trailer',
		'Transfer-Encoding',
		'Upgrade',
		'User-Agent',
		'Warning',
		'X-Requested-With',
		'X-UA-Compatible',
	] as const;

	/**
	 * Response header values that are allowed to be logged.
	 *
	 * If a response header is not present in the {@link responseHeaders},
	 * the header name will be logged with a redacted value.
	 */
	responseHeaders: readonly typeof HeaderNames[number][] = [
		'Accept-Ranges',
		'Age',
		'Allow',
		'Alt-Svc',
		'Connection',
		'Content-Disposition',
		'Content-Language',
		'Content-Length',
		'Content-Location',
		'Content-Range',
		'Content-Type',
		'Date',
		'Expires',
		'Last-Modified',
		'Location',
		'Server',
		'Transfer-Encoding',
		'Upgrade',
		'X-Powered-By',
	] as const;
}
