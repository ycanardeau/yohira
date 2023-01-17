import { getOrAddWithArgument } from '@yohira/base';

import { IOptionsMonitorCache } from './IOptionsMonitorCache';
import { Options } from './Options';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsCache.cs,0c185050ec5646f7,references
export class OptionsCache<TOptions> implements IOptionsMonitorCache<TOptions> {
	private readonly cache = new Map<string, TOptions>();

	clear(): void {
		this.cache.clear();
	}

	getOrAdd(
		name: string | undefined,
		createOptions: () => TOptions,
	): TOptions {
		// TODO
		throw new Error('Method not implemented.');
	}

	getOrAddWithArgument<TArg>(
		name: string | undefined,
		createOptions: (name: string, factory: TArg) => TOptions,
		factoryArgument: TArg,
	): TOptions {
		return getOrAddWithArgument(
			this.cache,
			name ?? Options.defaultName,
			(name, arg) => arg.createOptions(name, arg.factoryArgument),
			{ createOptions, factoryArgument },
		);
	}

	tryAdd(name: string | undefined, options: TOptions): boolean {
		// TODO
		throw new Error('Method not implemented.');
	}

	tryRemove(name: string | undefined): boolean {
		// TODO
		throw new Error('Method not implemented.');
	}
}
