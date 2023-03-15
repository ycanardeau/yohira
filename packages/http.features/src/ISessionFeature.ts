import { ISession } from './ISession';

export const ISessionFeature = Symbol.for('ISessionFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/ISessionFeature.cs,bd85b85b4cb303ff,references
/**
 * Provides access to the {@link ISession} for the current request.
 */
export interface ISessionFeature {
	/**
	 * The {@link ISession} for the current request.
	 */
	session: ISession;
}
