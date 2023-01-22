import { CaseInsensitiveMap } from '@yohira/base';
import { keyDelimiter } from '@yohira/extensions.config.abstractions';
import JSON5 from 'json5';
import { Readable, Stream } from 'node:stream';

// https://source.dot.net/#System.Text.Json/System/Text/Json/Document/JsonValueKind.cs,1ae5746019726119,references
enum JsonValueKind {
	/**
	 * Indicates that there is no value (as distinct from {@link Null}).
	 */
	Undefined,
	/**
	 * Indicates that a value is a JSON object.
	 */
	Object,
	/**
	 * Indicates that a value is a JSON array.
	 */
	Array,
	/**
	 * Indicates that a value is a JSON string.
	 */
	String,
	/**
	 * Indicates that a value is a JSON number.
	 */
	Number,
	/**
	 * Indicates that a value is the JSON value <c>true</c>.
	 */
	True,
	/**
	 * Indicates that a value is the JSON value <c>false</c>.
	 */
	False,
	/**
	 * Indicates that a value is the JSON value <c>null</c>.
	 */
	Null,
}

function getJsonValueKind(value: unknown): JsonValueKind {
	switch (typeof value) {
		case 'undefined':
			return JsonValueKind.Undefined;
		case 'string':
			return JsonValueKind.String;
		case 'number':
			return JsonValueKind.Number;
		case 'boolean':
			return value === false ? JsonValueKind.False : JsonValueKind.True;
		case 'object':
			if (value instanceof Array) {
				return JsonValueKind.Array;
			} else if (value === null) {
				return JsonValueKind.Null;
			} else {
				return JsonValueKind.Object;
			}
		default:
			throw new Error(/* TODO: message */);
	}
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.Json/JsonConfigurationFileParser.cs,dac10f795f76ae63,references
export class JsonConfigFileParser {
	private readonly data = new CaseInsensitiveMap<string | undefined>();
	private readonly paths: string[] = [];

	private enterContext(context: string): void {
		this.paths.push(
			this.paths.length > 0
				? this.paths[this.paths.length - 1] + keyDelimiter + context
				: context,
		);
	}

	private exitContext(): void {
		this.paths.pop();
	}

	private visitArrayElement(element: unknown[]): void {
		let index = 0;

		for (const arrayElement of element) {
			this.enterContext(index.toString());
			this.visitValue(arrayElement);
			this.exitContext();
			index++;
		}

		this.setUndefinedIfElementIsEmpty(index === 0);
	}

	private visitValue(value: unknown): void {
		if (this.paths.length === 0) {
			throw new Error('Assertion failed.');
		}

		const valueKind = getJsonValueKind(value);
		switch (valueKind) {
			case JsonValueKind.Object:
				this.visitObjectElement(value as object);
				break;

			case JsonValueKind.Array:
				this.visitArrayElement(value as Array<unknown>);
				break;

			case JsonValueKind.Number:
			case JsonValueKind.String:
			case JsonValueKind.True:
			case JsonValueKind.False:
			case JsonValueKind.Null:
				const key = this.paths[this.paths.length - 1];
				if (this.data.has(key)) {
					throw new Error(
						`A duplicate key '${key}' was found.` /* LOC */,
					);
				}
				this.data.set(key, `${value ?? ''}`);
				break;

			default:
				throw new Error(
					`Unsupported JSON token '${valueKind}' was found.` /* LOC */,
				);
		}
	}

	private setUndefinedIfElementIsEmpty(isEmpty: boolean): void {
		if (isEmpty && this.paths.length > 0) {
			this.data.set(this.paths[this.paths.length - 1], undefined);
		}
	}

	private visitObjectElement(element: object): void {
		let isEmpty = true;

		for (const [name, value] of Object.entries(element)) {
			isEmpty = false;
			this.enterContext(name);
			this.visitValue(value);
			this.exitContext();
		}

		this.setUndefinedIfElementIsEmpty(isEmpty);
	}

	private parseStream(input: Stream): CaseInsensitiveMap<string | undefined> {
		const doc = JSON5.parse((input as Readable).read());
		const valueKind = getJsonValueKind(doc);
		if (valueKind !== JsonValueKind.Object) {
			throw new Error(
				`Top-level JSON element must be an object. Instead, '${valueKind}' was found.` /* LOC */,
			);
		}
		this.visitObjectElement(doc);
		return this.data;
	}

	static parse(stream: Stream): CaseInsensitiveMap<string | undefined> {
		return new JsonConfigFileParser().parseStream(stream);
	}
}
