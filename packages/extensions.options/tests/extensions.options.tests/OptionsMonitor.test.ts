import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	IServiceCollection,
	ServiceCollection,
	addSingletonCtor,
	addSingletonInstance,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	IConfigureNamedOptions,
	IOptionsMonitor,
	IOptionsMonitorCache,
	Options,
	addOptions,
	configureOptionsServices,
} from '@yohira/extensions.options';
import { expect, test } from 'vitest';

import { FakeOptions } from './FakeOptions';
import { FakeOptionsFactory } from './FakeOptionsFactory';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsMonitorTest.cs#L17
test('MonitorUsesFactory', () => {
	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addSingletonCtor(
		$,
		Symbol.for('IOptionsFactory<FakeOptions>'),
		FakeOptionsFactory,
	);
	$ = configureOptionsServices(FakeOptions, $, (o) => {
		o.message = 'Ignored';
	});
	const services = buildServiceProvider($);

	const monitor = getRequiredService<IOptionsMonitor<FakeOptions>>(
		services,
		Symbol.for('IOptionsMonitor<FakeOptions>'),
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
	configureNamed(name: string | undefined, options: FakeOptions): void {
		setupInvokeCount++;
		options.message += setupInvokeCount;
	}

	configure(options: FakeOptions): void {
		return this.configureNamed(Options.defaultName, options);
	}
}

// TODO: class FakeSource

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsMonitorTest.cs#L74
test('CanClearNamedOptions', () => {
	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addOptions($);
	$ = addSingletonInstance(
		$,
		Symbol.for('IConfigureOptions<FakeOptions>'),
		new CountIncrement(),
	);

	const sp = buildServiceProvider($);

	const monitor = getRequiredService<IOptionsMonitor<FakeOptions>>(
		sp,
		Symbol.for('IOptionsMonitor<FakeOptions>'),
	);
	const cache = getRequiredService<IOptionsMonitorCache<FakeOptions>>(
		sp,
		Symbol.for('IOptionsMonitorCache<FakeOptions>'),
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
