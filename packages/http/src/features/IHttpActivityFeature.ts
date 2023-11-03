import { IDisposable } from '@yohira/base';

// https://source.dot.net/#System.Diagnostics.DiagnosticSource/System/Diagnostics/Activity.cs,dde15fa2c6eb71de,references
export class Activity implements IDisposable {
	[Symbol.dispose](): void {
		// TODO
	}
}

export const IHttpActivityFeature = Symbol.for('IHttpActivityFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/IHttpActivityFeature.cs,1441e1b7094429ee,references
/**
 * Feature to access the {@link Activity} associated with a request.
 */
export interface IHttpActivityFeature {
	/**
	 * Returns the {@link Activity} associated with the current request.
	 */
	activity: Activity;
}
