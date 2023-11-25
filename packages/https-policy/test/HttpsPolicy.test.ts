import { TimeSpan } from '@yohira/base';
import { HostBuilder } from '@yohira/extensions.hosting';
import { IHostBuilder } from '@yohira/extensions.hosting.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';
import {
	ServerAddressesFeature,
	configure,
	configureWebHost,
} from '@yohira/hosting';
import { IServerAddressesFeature } from '@yohira/hosting.server.abstractions';
import { addTerminalMiddleware, write } from '@yohira/http.abstractions';
import { HeaderNames } from '@yohira/http.headers';
import {
	HstsOptions,
	HttpsRedirectionOptions,
	useHsts,
	useHttpsRedirection,
} from '@yohira/https-policy';
import { getTestServer, useTestServer } from '@yohira/test-host';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Middleware/HttpsPolicy/test/HttpsPolicyTests.cs#L26C23-L26C97
test('SetsBothHstsAndHttpsRedirection_RedirectOnFirstRequest_HstsOnSecondRequest', async () => {
	async function SetsBothHstsAndHttpsRedirection_RedirectOnFirstRequest_HstsOnSecondRequest(
		statusCode: number,
		tlsPort: number | undefined,
		maxAge: number,
		includeSubDomains: boolean,
		preload: boolean,
		expectedHstsHeader: string,
		expectedUrl: string,
	): Promise<void> {
		let $: IHostBuilder = new HostBuilder();
		$ = configureWebHost($, (webHostBuilder) => {
			let $ = webHostBuilder;
			$ = useTestServer($).configureServices((_, services) => {
				configureOptionsServices<HttpsRedirectionOptions>(
					HttpsRedirectionOptions,
					services,
					(options) => {
						options.redirectStatusCode = statusCode;
						options.httpsPort = tlsPort;
					},
				);
				configureOptionsServices<HstsOptions>(
					HstsOptions,
					services,
					(options) => {
						options.includeSubDomains = includeSubDomains;
						options.maxAge = TimeSpan.fromSeconds(maxAge);
						options.preload = preload;
						options.excludedHosts = [] /* TODO: .clear() */; // allowing localhost for testing
					},
				);
			});
			configure($, (app) => {
				useHttpsRedirection(app);
				useHsts(app);
				addTerminalMiddleware(app, (context) => {
					return write(context.response, 'Hello world');
				});
			});
		});
		const host = $.build();

		await host.start();

		const server = getTestServer(host);
		server.features.set<IServerAddressesFeature>(
			IServerAddressesFeature,
			new ServerAddressesFeature(),
		);
		/* TODO: implement let client = server.createClient();

		let request = new HttpRequestMessage(HttpMethod.Get, '');

		let response = await client.send(request);

		expect(response.statusCode).toBe(statusCode);
		expect(response.headers.location.toString()).toBe(expectedUrl);

		client = server.createClient();
		client.baseAddress = new URL(response.header.location.toString());
		request = new HttpRequestMessage(HttpMethod.Get, expectedUrl);
		response = await client.send(request);

		expect(
			response.headers
				.getValues(HeaderNames.StrictTransportSecurity)
				.first(),
		).toBe(expectedHstsHeader); */
	}

	await SetsBothHstsAndHttpsRedirection_RedirectOnFirstRequest_HstsOnSecondRequest(
		302,
		443,
		2592000,
		false,
		false,
		'max-age=2592000',
		'https://localhost/',
	);
	await SetsBothHstsAndHttpsRedirection_RedirectOnFirstRequest_HstsOnSecondRequest(
		301,
		5050,
		2592000,
		false,
		false,
		'max-age=2592000',
		'https://localhost:5050/',
	);
	await SetsBothHstsAndHttpsRedirection_RedirectOnFirstRequest_HstsOnSecondRequest(
		301,
		443,
		2592000,
		false,
		false,
		'max-age=2592000',
		'https://localhost/',
	);
	await SetsBothHstsAndHttpsRedirection_RedirectOnFirstRequest_HstsOnSecondRequest(
		301,
		443,
		2592000,
		true,
		false,
		'max-age=2592000; includeSubDomains',
		'https://localhost/',
	);
	await SetsBothHstsAndHttpsRedirection_RedirectOnFirstRequest_HstsOnSecondRequest(
		301,
		443,
		2592000,
		false,
		true,
		'max-age=2592000; preload',
		'https://localhost/',
	);
	await SetsBothHstsAndHttpsRedirection_RedirectOnFirstRequest_HstsOnSecondRequest(
		301,
		443,
		2592000,
		true,
		true,
		'max-age=2592000; includeSubDomains; preload',
		'https://localhost/',
	);
	await SetsBothHstsAndHttpsRedirection_RedirectOnFirstRequest_HstsOnSecondRequest(
		302,
		5050,
		2592000,
		true,
		true,
		'max-age=2592000; includeSubDomains; preload',
		'https://localhost:5050/',
	);
});
