import { Resource } from './Resource';

/**
 * Represents a resource that can be executed as a standalone process.
 */
export class ExecutableResource extends Resource {
	/**
	 *
	 * @param name The name of the resource.
	 * @param command The command to execute.
	 * @param workingDirectory The working directory of the executable.
	 * @param args The arguments to pass to the executable.
	 */
	constructor(
		name: string,
		readonly command: string,
		readonly workingDirectory: string,
		readonly args: string[] | undefined,
	) {
		super(name);
	}
}
