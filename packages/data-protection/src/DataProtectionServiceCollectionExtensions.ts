import { IDataProtectionProvider } from '@yohira/data-protection.abstractions';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	getRequiredService,
	tryAddServiceDescriptor,
	tryAddServiceDescriptorIterable,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILoggerFactory,
	NullLoggerFactory,
} from '@yohira/extensions.logging.abstractions';
import { IOptions, addOptions } from '@yohira/extensions.options';

import { DataProtectionOptions } from './DataProtectionOptions';
import { IDataProtectionBuilder } from './IDataProtectionBuilder';
import { DataProtectionBuilder } from './internal/DataProtectionBuilder';
import { KeyManagementOptionsSetup } from './internal/KeyManagementOptions';
import { DefaultKeyResolver } from './key-management/DefaultKeyResolver';
import { IKeyManager } from './key-management/IKeyManager';
import { KeyRingBasedDataProtectionProvider } from './key-management/KeyRingBasedDataProtectionProvider';
import { KeyRingProvider } from './key-management/KeyRingProvider';
import { XmlKeyManager } from './key-management/XmlKeyManager';
import { IDefaultKeyResolver } from './key-management/internal/IDefaultKeyResolver';
import { IKeyRingProvider } from './key-management/internal/IKeyRingProvider';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/DataProtectionServiceCollectionExtensions.cs,fa9d3c53032971e2,references
function addDataProtectionServices(services: IServiceCollection): void {
	// TODO

	tryAddServiceDescriptorIterable(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('IConfigureOptions<KeyManagementOptions>'),
			KeyManagementOptionsSetup,
		),
	);
	// TODO

	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			IKeyManager,
			XmlKeyManager,
		),
	);
	// TODO

	// Internal services
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			IDefaultKeyResolver,
			DefaultKeyResolver,
		),
	);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			IKeyRingProvider,
			KeyRingProvider,
		),
	);

	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromFactory(
			ServiceLifetime.Singleton,
			IDataProtectionProvider,
			(s) => {
				const dpOptions = getRequiredService<
					IOptions<DataProtectionOptions>
				>(s, Symbol.for('IOptions<DataProtectionOptions>'));
				const keyRingProvider = getRequiredService<IKeyRingProvider>(
					s,
					IKeyRingProvider,
				);
				const loggerFactory =
					s.getService<ILoggerFactory>(ILoggerFactory) ??
					NullLoggerFactory.instance;

				let dataProtectionProvider: IDataProtectionProvider =
					new KeyRingBasedDataProtectionProvider(
						keyRingProvider,
						loggerFactory,
					);

				// Link the provider to the supplied discriminator
				if (
					dpOptions.getValue(DataProtectionOptions).appDiscriminator
				) {
					dataProtectionProvider =
						dataProtectionProvider.createProtector(
							dpOptions.getValue(DataProtectionOptions)
								.appDiscriminator!,
						);
				}

				return dataProtectionProvider;
			},
		),
	);

	// TODO
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/DataProtectionServiceCollectionExtensions.cs,603c3b23853cc8f0,references
export function addDataProtection(
	services: IServiceCollection,
): IDataProtectionBuilder {
	// TODO
	addOptions(services);
	addDataProtectionServices(services);

	return new DataProtectionBuilder(services);
}
