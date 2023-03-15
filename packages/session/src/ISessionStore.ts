import { ISession } from '@yohira/http.features';

export const ISessionStore = Symbol.for('ISessionStore');
// https://source.dot.net/#Microsoft.AspNetCore.Session/ISessionStore.cs,32e97b0c29754b14,references
export interface ISessionStore {
	create(
		sessionKey: string,
		// TODO: idleTimeout,
		// TODO: ioTimeout,
		tryEstablishSession: () => boolean,
		isNewSessionKey: boolean,
	): ISession;
}
