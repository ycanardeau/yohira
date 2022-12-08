// https://source.dot.net/#Microsoft.Extensions.FileProviders.Abstractions/IFileInfo.cs,8fbb3d8e81993aff,references
/**
 * Represents a file in the given file provider.
 */
export interface IFileInfo {
	/**
	 * True if resource exists in the underlying storage system.
	 */
	readonly exists: boolean;
	/**
	 * The name of the file or directory, not including any path.
	 */
	readonly name: string;
}
