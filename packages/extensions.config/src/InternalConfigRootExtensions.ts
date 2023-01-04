import { IConfigRoot } from '@yohira/extensions.config.abstractions/IConfigRoot';
import { IConfigSection } from '@yohira/extensions.config.abstractions/IConfigSection';

// https://source.dot.net/#Microsoft.Extensions.Configuration/InternalConfigurationRootExtensions.cs,84496613351a073c,references
export const getChildrenImpl = (
	root: IConfigRoot,
	path: string | undefined,
): IConfigSection[] => {
	// TODO
	throw new Error('Method not implemented.');
};
