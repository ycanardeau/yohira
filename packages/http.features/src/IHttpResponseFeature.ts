export const IHttpResponseFeature = Symbol.for('IHttpResponseFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IHttpResponseFeature.cs,cac9ce0faa55e5f2,references
export interface IHttpResponseFeature {
	onStarting(callback: (state: object) => Promise<void>, state: object): void;
}
