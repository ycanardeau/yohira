import { ConfigDebugViewContext } from '@yohira/extensions.config.abstractions/ConfigDebugViewContext';
import { IConfigProvider } from '@yohira/extensions.config.abstractions/IConfigProvider';
import { IConfigRoot } from '@yohira/extensions.config.abstractions/IConfigRoot';
import { IConfigSection } from '@yohira/extensions.config.abstractions/IConfigSection';

function getValueAndProvider(
	root: IConfigRoot,
	key: string,
): {
	value: string | undefined;
	provider: IConfigProvider | undefined;
} {
	for (const provider of root.providers) {
		const tryGetResult = provider.tryGet(key);
		if (tryGetResult.ok) {
			return { value: tryGetResult.val, provider: provider };
		}
	}

	return { value: undefined, provider: undefined };
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/ConfigurationRootExtensions.cs,510ec8ffff734557,references
export function getDebugView(
	root: IConfigRoot,
	processValue?: (context: ConfigDebugViewContext) => string,
): string {
	function recurseChildren(
		stringBuilder: string[],
		children: IConfigSection[],
		indent: string,
	): void {
		for (const child of children) {
			const { value, provider } = getValueAndProvider(root, child.path);

			if (provider !== undefined) {
				const processedValue =
					processValue !== undefined
						? processValue(
								new ConfigDebugViewContext(
									child.path,
									child.key,
									value,
									provider,
								),
						  )
						: value;

				stringBuilder.push(
					indent,
					child.key,
					'=',
					processedValue ?? '',
					' (',
					provider.toString(),
					')',
					'\n',
				);
			} else {
				stringBuilder.push(indent, child.key, ':', '\n');
			}

			recurseChildren(stringBuilder, child.getChildren(), indent + '  ');
		}
	}

	const builder: string[] = [];

	recurseChildren(builder, root.getChildren(), '');

	return builder.join('');
}
