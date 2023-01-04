import { Ctor } from '@yohira/base/Type';
import { IConfig } from '@yohira/extensions.config.abstractions/IConfig';
import { BinderOptions } from '@yohira/extensions.config.binder/BinderOptions';
import { BindingPoint } from '@yohira/extensions.config.binder/BindingPoint';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Binder/ConfigurationBinder.cs,9b06a6c17e1aa689,references
const bindProperties = (
	instance: object,
	config: IConfig,
	options: BinderOptions,
): void => {
	// TODO

	if (options.errorOnUnknownConfig) {
		// TODO
		throw new Error('Method not implemented.');
	}

	// TODO
	throw new Error('Method not implemented.');
};

// https://source.dot.net/#Microsoft.Extensions.Configuration.Binder/ConfigurationBinder.cs,f87b0f53a2b9251a,references
const bindInstance = (
	ctor: Ctor,
	bindingPoint: BindingPoint,
	config: IConfig,
	options: BinderOptions,
): void => {
	// TODO

	if (bindingPoint.value === undefined) {
		throw new Error('Assertion failed.');
	}

	// TODO
	bindProperties(bindingPoint.value, config, options);
};

// https://source.dot.net/#Microsoft.Extensions.Configuration.Binder/ConfigurationBinder.cs,a9de1082cf7e70ca,references
export const bind = (
	config: IConfig,
	instance: object | undefined,
	configureOptions: ((options: BinderOptions) => void) | undefined,
): void => {
	if (instance !== undefined) {
		const options = new BinderOptions();
		configureOptions?.(options);
		const bindingPoint = new BindingPoint(instance, true);
		bindInstance(
			instance.constructor as Ctor,
			bindingPoint,
			config,
			options,
		);
	}
};
