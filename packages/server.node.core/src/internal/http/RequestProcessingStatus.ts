// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/Http/RequestProcessingStatus.cs,95b6e81e2d1ab43e,references
export enum RequestProcessingStatus {
	RequestPending,
	ParsingRequestLine,
	ParsingHeaders,
	AppStarted,
	HeadersCommitted,
	HeadersFlushed,
	ResponseCompleted,
}
