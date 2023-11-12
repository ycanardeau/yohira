import { AntiforgeryToken } from './AntiforgeryToken';

export const IAntiforgeryTokenSerializer = Symbol.for(
	'IAntiforgeryTokenSerializer',
);
// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/IAntiforgeryTokenSerializer.cs,fafa293a1062586b,references
// Abstracts out the serialization process for an antiforgery token
export interface IAntiforgeryTokenSerializer {
	deserialize(serializedToken: string): AntiforgeryToken;
	serialize(token: AntiforgeryToken): string;
}
