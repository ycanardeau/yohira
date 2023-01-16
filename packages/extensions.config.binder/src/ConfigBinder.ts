import { BinderOptions } from '@/BinderOptions';
import { BindingPoint } from '@/BindingPoint';
import { PropertyInfo, getProperties } from '@/type';
import { Ctor } from '@yohira/base';
import {
	IConfig,
	IConfigSection,
} from '@yohira/extensions.config.abstractions';
import { Ok, Result } from '@yohira/third-party.ts-results';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Binder/ConfigurationBinder.cs,fc155b7d06f7f55f,references
function tryConvertValue(
	ctor: Ctor,
	value: string,
	path: string | undefined,
): Result<string | number | boolean | undefined, Error> {
	if (ctor === String) {
		return new Ok(String(value));
	} else if (ctor === Number) {
		return new Ok(Number(value));
	} else if (ctor === Boolean) {
		switch (value.toLowerCase()) {
			case 'true':
				return new Ok(true);
			case 'false':
				return new Ok(false);
			default:
				return new Ok(false);
		}
	} else {
		// TODO
		throw new Error('Method not implemented.');
	}
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.Binder/ConfigurationBinder.cs,a18305cb82093d18,references
function getPropertyName(property: PropertyInfo): string {
	// TODO
	return property.name;
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.Binder/ConfigurationBinder.cs,fd12934fd6da12d8,references
function bindProperty(
	property: PropertyInfo,
	instance: Record<string, any>,
	config: IConfig,
	options: BinderOptions,
): void {
	// TODO

	const propertyBindingPoint = new BindingPoint(
		undefined,
		() => instance[property.name],
		false /* TODO */,
	);

	bindInstance(
		property.ctorFunc(),
		propertyBindingPoint,
		config.getSection(getPropertyName(property)),
		options,
	);

	if (propertyBindingPoint.hasNewValue) {
		instance[property.name] = propertyBindingPoint.value;
	}
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.Binder/ConfigurationBinder.cs,9b06a6c17e1aa689,references
function bindProperties(
	instance: object,
	config: IConfig,
	options: BinderOptions,
): void {
	const modelProperties = getProperties(instance.constructor as Ctor);

	if (options.errorOnUnknownConfig) {
		// TODO
		throw new Error('Method not implemented.');
	}

	for (const property of modelProperties) {
		bindProperty(property, instance, config, options);
	}
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.Binder/ConfigurationBinder.cs,f87b0f53a2b9251a,references
function bindInstance(
	ctor: Ctor,
	bindingPoint: BindingPoint,
	config: IConfig | IConfigSection,
	options: BinderOptions,
): void {
	// TODO

	if ('key' in config && 'path' in config && 'value' in config) {
		const section = config;
		const configValue = section.value;
		if (configValue !== undefined) {
			const tryConvertValueResult = tryConvertValue(
				ctor,
				configValue,
				section.path,
			);
			const convertedValue = tryConvertValueResult.unwrap();
			bindingPoint.trySetValue(convertedValue as any /* TODO */);
			return;
		}
	}

	if (config.getChildren().length > 0) {
		// TODO

		if (bindingPoint.value === undefined) {
			throw new Error('Assertion failed.');
		}

		// TODO
		bindProperties(bindingPoint.value, config, options);
	}
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.Binder/ConfigurationBinder.cs,a9de1082cf7e70ca,references
export function bind(
	config: IConfig,
	instance: object | undefined,
	configureOptions: (options: BinderOptions) => void = (): void => {},
): void {
	if (instance !== undefined) {
		const options = new BinderOptions();
		configureOptions?.(options);
		const bindingPoint = new BindingPoint(instance, undefined, true);
		bindInstance(
			instance.constructor as Ctor,
			bindingPoint,
			config,
			options,
		);
	}
}
