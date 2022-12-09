// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/Internal/PathUtils.cs,01973375afd0c585,references
const invalidFileNameCharsRegExp = new RegExp(
	/["<>|\u0000-\u001F:*?]/ /* TODO: Vary by file system. */,
);

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/Internal/PathUtils.cs,25bea12c519603bd,references
export const hasInvalidPathChars = (path: string): boolean => {
	return invalidFileNameCharsRegExp.test(path);
};
