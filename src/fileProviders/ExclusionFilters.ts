// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/ExclusionFilters.cs,8a8444f0d1a79ef4,references
export enum ExclusionFilters {
	/**
	 * Do not exclude any files.
	 */
	None = 0,
	/**
	 * Exclude files and directories when the name begins with period.
	 */
	DotPrefixed = 0x0001,
	/**
	 * Exclude files and directories when <see cref="FileAttributes.Hidden"/> is set on <see cref="FileSystemInfo.Attributes"/>.
	 */
	Hidden = 0x0002,
	/**
	 * Exclude files and directories when <see cref="FileAttributes.System"/> is set on <see cref="FileSystemInfo.Attributes"/>.
	 */
	System = 0x0004,
	/**
	 * Equivalent to <c>DotPrefixed | Hidden | System</c>. Exclude files and directories when the name begins with a period, or has either <see cref="FileAttributes.Hidden"/> or <see cref="FileAttributes.System"/> is set on <see cref="FileSystemInfo.Attributes"/>.
	 */
	Sensitive = DotPrefixed | Hidden | System,
}
