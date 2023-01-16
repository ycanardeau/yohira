import {
	IConfigRoot,
	IConfigSection,
	combineConfigPath,
} from '@yohira/extensions.config.abstractions';

// https://source.dot.net/#Microsoft.Extensions.Configuration/InternalConfigurationRootExtensions.cs,84496613351a073c,references
export function getChildrenImpl(
	root: IConfigRoot,
	path: string | undefined,
): IConfigSection[] {
	// TODO
	const providers = /* TODO */ root.providers;

	const children = [
		...new Set(
			Array.from(providers).reduce(
				(seed, source) => source.getChildKeys(seed, path),
				[] as string[],
			),
		),
	].map((key) =>
		root.getSection(
			path === undefined ? key : combineConfigPath(path, key),
		),
	);

	// TODO
	return children;
}
