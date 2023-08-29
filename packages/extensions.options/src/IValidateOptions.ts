import { ValidateOptionsResult } from './ValidateOptionsResult';

// https://source.dot.net/#Microsoft.Extensions.Options/IValidateOptions.cs,e842d6d1ef3f4ab9,references
/**
 * Interface used to validate options.
 */
export interface IValidateOptions<TOptions> {
	validate(
		name: string | undefined,
		options: TOptions,
	): ValidateOptionsResult;
}
