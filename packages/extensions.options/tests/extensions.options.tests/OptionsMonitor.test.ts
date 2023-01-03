import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollection';
import {
	addSingletonCtor,
	addSingletonInstance,
} from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions/ServiceProviderServiceExtensions';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection/ServiceCollectionContainerBuilderExtensions';
import { IConfigureNamedOptions } from '@yohira/extensions.options/IConfigureNamedOptions';
import { IOptionsMonitor } from '@yohira/extensions.options/IOptionsMonitor';
import { IOptionsMonitorCache } from '@yohira/extensions.options/IOptionsMonitorCache';
import { Options } from '@yohira/extensions.options/Options';
import {
	addOptions,
	configureOptionsServices,
} from '@yohira/extensions.options/OptionsServiceCollectionExtensions';
import { expect, test } from 'vitest';

import { FakeOptions } from './FakeOptions';
import { FakeOptionsFactory } from './FakeOptionsFactory';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsMonitorTest.cs#L17
test('MonitorUsesFactory', () => {
	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addSingletonCtor($, 'IOptionsFactory<FakeOptions>', FakeOptionsFactory);
	$ = configureOptionsServices($, FakeOptions, (o) => {
		o.message = 'Ignored';
	});
	const services = buildServiceProvider($);

	const monitor = getRequiredService<IOptionsMonitor<FakeOptions>>(
		services,
		'IOptionsMonitor<FakeOptions>',
	);
	expect(monitor.getCurrentValue(FakeOptions)).toBe(
		FakeOptionsFactory.options,
	);
	expect(monitor.get(FakeOptions, '1')).toBe(FakeOptionsFactory.options);
	expect(monitor.get(FakeOptions, 'bsdfsdf')).toBe(
		FakeOptionsFactory.options,
	);
});

let setupInvokeCount = 0;

class CountIncrement implements IConfigureNamedOptions<FakeOptions> {
	configureNamed = (name: string | undefined, options: FakeOptions): void => {
		setupInvokeCount++;
		options.message += setupInvokeCount;
	};

	configure = (options: FakeOptions): void =>
		this.configureNamed(Options.defaultName, options);
}

// TODO: class FakeSource

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsMonitorTest.cs#L74
test('CanClearNamedOptions', () => {
	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addOptions($);
	$ = addSingletonInstance(
		$,
		'IConfigureOptions<FakeOptions>',
		new CountIncrement(),
	);

	const sp = buildServiceProvider($);

	const monitor = getRequiredService<IOptionsMonitor<FakeOptions>>(
		sp,
		'IOptionsMonitor<FakeOptions>',
	);
	const cache = getRequiredService<IOptionsMonitorCache<FakeOptions>>(
		sp,
		'IOptionsMonitorCache<FakeOptions>',
	);
	expect(monitor.get(FakeOptions, '#1').message).toBe('1');
	expect(monitor.get(FakeOptions, '#2').message).toBe('2');
	expect(monitor.get(FakeOptions, '#1').message).toBe('1');
	expect(monitor.get(FakeOptions, '#2').message).toBe('2');
	cache.clear();
	expect(monitor.get(FakeOptions, '#1').message).toBe('3');
	expect(monitor.get(FakeOptions, '#2').message).toBe('4');
	expect(monitor.get(FakeOptions, '#1').message).toBe('3');
	expect(monitor.get(FakeOptions, '#2').message).toBe('4');

	cache.clear();
	expect(monitor.get(FakeOptions, '#1').message).toBe('5');
	expect(monitor.get(FakeOptions, '#2').message).toBe('6');
	expect(monitor.get(FakeOptions, '#1').message).toBe('5');
	expect(monitor.get(FakeOptions, '#2').message).toBe('6');
});

// TODO
