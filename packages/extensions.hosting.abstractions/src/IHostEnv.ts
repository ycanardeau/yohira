// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/IHostEnvironment.cs,37d39d4dc6955525,references
export interface IHostEnv {
	/**
	 *  Gets or sets the name of the environment. The host automatically sets this property to the value of the
	 * "environment" key as specified in configuration.
	 */
	envName: string;
	/**
	 * Gets or sets the absolute path to the directory that contains the application content files.
	 */
	contentRootPath: string;
}
