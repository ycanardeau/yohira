// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Server.Abstractions/IHostContextContainer.cs,49aada8a457b996a,references
/**
 * When implemented by a Server allows an {@link IHttpApplication{TContext}} to pool and reuse
 * its <typeparamref name="TContext"/> between requests.
 */
export interface IHostContextContainer<TContext> {
	/**
	 * Represents the {@link TContext}  of the host.
	 */
	hostContext: TContext | undefined;
}
