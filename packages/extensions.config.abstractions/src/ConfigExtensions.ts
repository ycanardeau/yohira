import { Ctor } from '@yohira/base';

import { IConfig } from './IConfig';
import { IConfigBuilder } from './IConfigBuilder';
import { IConfigSection } from './IConfigSection';
import { IConfigSource } from './IConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/ConfigurationExtensions.cs,94ff96edc2d43dbd,references
export function addConfigSource<TSource extends IConfigSource>(
	sourceCtor: Ctor<TSource>,
	builder: IConfigBuilder,
	configureSource: ((source: TSource) => void) | undefined,
): IConfigBuilder {
	const source = new sourceCtor();
	configureSource?.(source);
	return builder.add(source);
}

export function getConnectionString(
	config: IConfig,
	name: string,
): string | undefined {
	return config?.getSection('ConnectionStrings').get(name);
}

function isIConfigSection(
	config: IConfig | IConfigSection,
): config is IConfigSection {
	return 'key' in config && 'path' in config && 'value' in config;
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/ConfigurationExtensions.cs,c921372a618475b0,references
export function* asIterable(
	config: IConfig | IConfigSection,
	makePathsRelative = false,
): Generator<[string, string | undefined]> {
	const stack: (IConfig | IConfigSection)[] = [];
	stack.push(config);
	const prefixLength =
		makePathsRelative && isIConfigSection(config)
			? config.path.length + 1
			: 0;
	while (stack.length > 0) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const section = stack.pop()!;
		if (
			isIConfigSection(section) &&
			(!makePathsRelative || section !== config)
		) {
			yield [section.path.substring(prefixLength), section.value];
		}
		for (const child of section.getChildren()) {
			stack.push(child);
		}
	}
}
