import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollection';
import { addSingletonCtor } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions/ServiceProviderServiceExtensions';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection/ServiceCollectionContainerBuilderExtensions';
import { IOptions } from '@yohira/extensions.options/IOptions';
import { configureOptionsServices } from '@yohira/extensions.options/OptionsServiceCollectionExtensions';
import { expect, test } from 'vitest';

import { FakeOptions } from './FakeOptions';
import { FakeOptionsFactory } from './FakeOptionsFactory';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsTest.cs#L18
test('UsesFactory', () => {
	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addSingletonCtor($, 'IOptionsFactory<FakeOptions>', FakeOptionsFactory);
	$ = configureOptionsServices($, FakeOptions, (o) => {
		o.message = 'Ignored';
	});
	const services = buildServiceProvider($);

	const snap = getRequiredService<IOptions<FakeOptions>>(
		services,
		'IOptions<FakeOptions>',
	);
	expect(snap.getValue(FakeOptions)).toBe(FakeOptionsFactory.options);
});

// TODO
