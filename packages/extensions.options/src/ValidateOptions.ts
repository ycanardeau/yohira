import { IValidateOptions } from './IValidateOptions';
import { ValidateOptionsResult } from './ValidateOptionsResult';

// https://source.dot.net/#Microsoft.Extensions.Options/ValidateOptions.cs,221468a290ee526a,references
/**
 * Implementation of {@link IValidateOptions{TOptions}}
 */
export class ValidateOptions<TOptions> implements IValidateOptions<TOptions> {
	constructor(
		/**
		 * The options name.
		 */
		readonly name: string | undefined,
		/**
		 * The validation function.
		 */
		readonly validation: (options: TOptions) => boolean,
		/**
		 * The error to return when validation fails.
		 */
		readonly failureMessage: string,
	) {}

	validate(
		name: string | undefined,
		options: TOptions,
	): ValidateOptionsResult {
		// TODO
		throw new Error('Method not implemented.');
	}
}
