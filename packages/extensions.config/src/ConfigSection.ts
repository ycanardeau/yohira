import { combineConfigPath } from '@yohira/extensions.config.abstractions/ConfigPath';
import { IConfigRoot } from '@yohira/extensions.config.abstractions/IConfigRoot';
import { IConfigSection } from '@yohira/extensions.config.abstractions/IConfigSection';

// https://source.dot.net/#Microsoft.Extensions.Configuration/ConfigurationSection.cs,b07a8fc9758fd876,references
export class ConfigSection implements IConfigSection {
	private _key?: string;

	constructor(private readonly root: IConfigRoot, readonly path: string) {}

	get key(): string {
		// TODO
		throw new Error('Method not implemented.');
	}

	get value(): string | undefined {
		return this.root.get(this.path);
	}
	set value(value: string | undefined) {
		this.root.set(this.path, value);
	}

	get = (key: string): string | undefined => {
		return this.root.get(combineConfigPath(this.path, key));
	};

	set = (key: string, value: string | undefined): void => {
		this.root.set(combineConfigPath(this.path, key), value);
	};

	getSection = (key: string): IConfigSection => {
		return this.root.getSection(combineConfigPath(this.path, key));
	};

	getChildren = (): IConfigSection[] => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
