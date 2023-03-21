import { IOptions } from './IOptions';
import { OptionsWrapper } from './OptionsWrapper';

export const Options = {
	defaultName: '',
} as const;

export function createOptions<TOptions>(options: TOptions): IOptions<TOptions> {
	return new OptionsWrapper(options);
}
