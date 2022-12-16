// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Server.Abstractions/IHttpApplication.cs,c9372883dbd987ab,references
export interface IHttpApp<TContext> {
	createContext(/* TODO: contextFeatures */): TContext;
	processRequest(context: TContext): Promise<void>;
	disposeContext(context: TContext, error: Error | undefined): void;
}
