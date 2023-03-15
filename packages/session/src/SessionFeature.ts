import { ISession, ISessionFeature } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Session/SessionFeature.cs,05162fe6e1cbbeae,references
export class SessionFeature implements ISessionFeature {
	session!: ISession;
}
