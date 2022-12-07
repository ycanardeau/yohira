// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/PathString.cs,ff3b073b1591ea45,references
export class PathString {
	readonly value: string | undefined;

	constructor(value: string | undefined) {
		if (!!value && value[0] !== '/') {
			throw new Error("The path in 'value' must start with '/'.");
		}
		this.value = value;
	}

	static readonly empty = new PathString('');
}
