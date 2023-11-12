import { AntiforgeryOptions, addAntiforgery } from '@yohira/antiforgery';
import { addDataProtection, setApplicationName } from '@yohira/data-protection';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	ServiceCollection,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import { IOptions, configureOptionsServices } from '@yohira/extensions.options';
import { CookieSecurePolicy } from '@yohira/http.abstractions';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/AntiforgeryOptionsSetupTest.cs#L16
test('AntiforgeryOptionsSetup_SetsDefaultCookieName_BasedOnApplicationId', () => {
	function AntiforgeryOptionsSetup_SetsDefaultCookieName_BasedOnApplicationId(
		applicationId: string,
		expectedCookieName: string,
	): void {
		const serviceCollection = new ServiceCollection();
		addAntiforgery(serviceCollection);
		setApplicationName(addDataProtection(serviceCollection), applicationId);

		const services = buildServiceProvider(serviceCollection);
		const options = getRequiredService<IOptions<AntiforgeryOptions>>(
			services,
			Symbol.for('IOptions<AntiforgeryOptions>'),
		);

		const cookieName = options.getValue(AntiforgeryOptions).cookie.name;

		expect(cookieName).toBe(expectedCookieName);
	}

	AntiforgeryOptionsSetup_SetsDefaultCookieName_BasedOnApplicationId(
		'HelloWorldApp',
		'.yohira.antiforgery.tGmK82_ckDw',
	);
	AntiforgeryOptionsSetup_SetsDefaultCookieName_BasedOnApplicationId(
		'TodoCalendar',
		'.yohira.antiforgery.7mK1hBEBwYs',
	);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/AntiforgeryOptionsSetupTest.cs#L38C17-L38C74
test('AntiforgeryOptionsSetup_UserOptionsSetup_CanSetCookieName', () => {
	const serviceCollection = new ServiceCollection();
	configureOptionsServices(AntiforgeryOptions, serviceCollection, (o) => {
		expect(o.cookie.name).toBeUndefined();
		o.cookie.name = 'antiforgery';
	});
	addAntiforgery(serviceCollection);
	setApplicationName(addDataProtection(serviceCollection), 'HelloWorldApp');

	const services = buildServiceProvider(serviceCollection);
	const options = getRequiredService<IOptions<AntiforgeryOptions>>(
		services,
		Symbol.for('IOptions<AntiforgeryOptions>'),
	);

	const cookieName = options.getValue(AntiforgeryOptions).cookie.name;

	expect(cookieName).toBe('antiforgery');
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/AntiforgeryOptionsSetupTest.cs#L63C17-L63C75
test('AntiforgeryOptions_SetsCookieSecurePolicy_ToNone_ByDefault', () => {
	const options = new AntiforgeryOptions();

	expect(options.cookie.securePolicy).toBe(CookieSecurePolicy.None);
});
