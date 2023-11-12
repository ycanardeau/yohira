import { configureOptionsServices } from '@yohira/extensions.options';

import { DataProtectionOptions } from './DataProtectionOptions';
import { IDataProtectionBuilder } from './IDataProtectionBuilder';

export function setApplicationName(
	builder: IDataProtectionBuilder,
	applicationName: string,
): IDataProtectionBuilder {
	configureOptionsServices(
		DataProtectionOptions,
		builder.services,
		(options) => {
			options.appDiscriminator = applicationName;
		},
	);

	return builder;
}
