import { Ctor } from '@yohira/base';
import {
	IServiceCollection,
	addSingletonInstance,
} from '@yohira/extensions.dependency-injection.abstractions';

import { Options } from './Options';
import { ValidateOptions } from './ValidateOptions';

const defaultValidationFailureMessage = 'A validation error has occurred.';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsBuilder.cs,148d726263cfbbfa,references
/**
 * Used to configure TOptions instances.
 */
export class OptionsBuilder<TOptions> {
	/**
	 * The default name of the TOptions instance.
	 */
	readonly name: string;

	constructor(
		/**
		 * The {@link IServiceCollection} for the options being configured.
		 */
		readonly services: IServiceCollection,
		name: string | undefined,
	) {
		this.name = name ?? Options.defaultName;
	}

	validate(
		optionsCtor: Ctor<TOptions>,
		validation: (options: TOptions) => boolean,
		failureMessage = defaultValidationFailureMessage,
	): OptionsBuilder<TOptions> {
		addSingletonInstance(
			this.services,
			Symbol.for(`IValidateOptions<${optionsCtor.name}>`),
			new ValidateOptions<TOptions>(
				this.name,
				validation,
				failureMessage,
			),
		);

		return this;
	}
}
