// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpRequestLog.cs,1ec73d8f7e4bec03,references
export class HttpRequestLog {
	private cachedString: string | undefined;

	constructor(private readonly keyValues: [string, string | undefined][]) {}

	toString(): string {
		if (this.cachedString === undefined) {
			const lines: string[] = [];
			lines.push('Request:');

			lines.push(
				...this.keyValues.map(([key, value]) => `${key}: ${value}`),
			);

			this.cachedString = lines.join('\n');
		}

		return this.cachedString;
	}
}
