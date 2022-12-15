// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/StatusCodes.cs,37ecc92968c68b9b,references
export enum StatusCodes {
	/**
	 * HTTP status code 100.
	 */
	Status100Continue = 100,
	/**
	 * HTTP status code 101.
	 */
	Status101SwitchingProtocols = 101,
	/**
	 * HTTP status code 102.
	 */
	Status102Processing = 102,
	/**
	 * HTTP status code 200.
	 */
	Status200OK = 200,
	/**
	 * HTTP status code 201.
	 */
	Status201Created = 201,
	/**
	 * HTTP status code 202.
	 */
	Status202Accepted = 202,
	/**
	 * HTTP status code 203.
	 */
	Status203NonAuthoritative = 203,
	/**
	 * HTTP status code 204.
	 */
	Status204NoContent = 204,
	/**
	 * HTTP status code 205.
	 */
	Status205ResetContent = 205,
	/**
	 * HTTP status code 206.
	 */
	Status206PartialContent = 206,
	/**
	 * HTTP status code 207.
	 */
	Status207MultiStatus = 207,
	/**
	 * HTTP status code 208.
	 */
	Status208AlreadyReported = 208,
	/**
	 * HTTP status code 226.
	 */
	Status226IMUsed = 226,
	/**
	 * HTTP status code 300.
	 */
	Status300MultipleChoices = 300,
	/**
	 * HTTP status code 301.
	 */
	Status301MovedPermanently = 301,
	/**
	 * HTTP status code 302.
	 */
	Status302Found = 302,
	/**
	 * HTTP status code 303.
	 */
	Status303SeeOther = 303,
	/**
	 * HTTP status code 304.
	 */
	Status304NotModified = 304,
	/**
	 * HTTP status code 305.
	 */
	Status305UseProxy = 305,
	/**
	 * HTTP status code 306.
	 */
	Status306SwitchProxy = 306, // RFC 2616, removed
	/**
	 * HTTP status code 307.
	 */
	Status307TemporaryRedirect = 307,
	/**
	 * HTTP status code 308.
	 */
	Status308PermanentRedirect = 308,
	/**
	 * HTTP status code 400.
	 */
	Status400BadRequest = 400,
	/**
	 * HTTP status code 401.
	 */
	Status401Unauthorized = 401,
	/**
	 * HTTP status code 402.
	 */
	Status402PaymentRequired = 402,
	/**
	 * HTTP status code 403.
	 */
	Status403Forbidden = 403,
	/**
	 * HTTP status code 404.
	 */
	Status404NotFound = 404,
	/**
	 * HTTP status code 405.
	 */
	Status405MethodNotAllowed = 405,
	/**
	 * HTTP status code 406.
	 */
	Status406NotAcceptable = 406,
	/**
	 * HTTP status code 407.
	 */
	Status407ProxyAuthenticationRequired = 407,
	/**
	 * HTTP status code 408.
	 */
	Status408RequestTimeout = 408,
	/**
	 * HTTP status code 409.
	 */
	Status409Conflict = 409,
	/**
	 * HTTP status code 410.
	 */
	Status410Gone = 410,
	/**
	 * HTTP status code 411.
	 */
	Status411LengthRequired = 411,
	/**
	 * HTTP status code 412.
	 */
	Status412PreconditionFailed = 412,
	/**
	 * HTTP status code 413.
	 */
	Status413RequestEntityTooLarge = 413, // RFC 2616, renamed
	/**
	 * HTTP status code 413.
	 */
	Status413PayloadTooLarge = 413, // RFC 7231
	/**
	 * HTTP status code 414.
	 */
	Status414RequestUriTooLong = 414, // RFC 2616, renamed
	/**
	 * HTTP status code 414.
	 */
	Status414UriTooLong = 414, // RFC 7231
	/**
	 * HTTP status code 415.
	 */
	Status415UnsupportedMediaType = 415,
	/**
	 * HTTP status code 416.
	 */
	Status416RequestedRangeNotSatisfiable = 416, // RFC 2616, renamed
	/**
	 * HTTP status code 416.
	 */
	Status416RangeNotSatisfiable = 416, // RFC 7233
	/**
	 * HTTP status code 417.
	 */
	Status417ExpectationFailed = 417,
	/**
	 * HTTP status code 418.
	 */
	Status418ImATeapot = 418,
	/**
	 * HTTP status code 419.
	 */
	Status419AuthenticationTimeout = 419, // Not defined in any RFC
	/**
	 * HTTP status code 421.
	 */
	Status421MisdirectedRequest = 421,
	/**
	 * HTTP status code 422.
	 */
	Status422UnprocessableEntity = 422,
	/**
	 * HTTP status code 423.
	 */
	Status423Locked = 423,
	/**
	 * HTTP status code 424.
	 */
	Status424FailedDependency = 424,
	/**
	 * HTTP status code 426.
	 */
	Status426UpgradeRequired = 426,
	/**
	 * HTTP status code 428.
	 */
	Status428PreconditionRequired = 428,
	/**
	 * HTTP status code 429.
	 */
	Status429TooManyRequests = 429,
	/**
	 * HTTP status code 431.
	 */
	Status431RequestHeaderFieldsTooLarge = 431,
	/**
	 * HTTP status code 451.
	 */
	Status451UnavailableForLegalReasons = 451,
	/**
	 * HTTP status code 500.
	 */
	Status500InternalServerError = 500,
	/**
	 * HTTP status code 501.
	 */
	Status501NotImplemented = 501,
	/**
	 * HTTP status code 502.
	 */
	Status502BadGateway = 502,
	/**
	 * HTTP status code 503.
	 */
	Status503ServiceUnavailable = 503,
	/**
	 * HTTP status code 504.
	 */
	Status504GatewayTimeout = 504,
	/**
	 * HTTP status code 505.
	 */
	Status505HttpVersionNotsupported = 505,
	/**
	 * HTTP status code 506.
	 */
	Status506VariantAlsoNegotiates = 506,
	/**
	 * HTTP status code 507.
	 */
	Status507InsufficientStorage = 507,
	/**
	 * HTTP status code 508.
	 */
	Status508LoopDetected = 508,
	/**
	 * HTTP status code 510.
	 */
	Status510NotExtended = 510,
	/**
	 * HTTP status code 511.
	 */
	Status511NetworkAuthenticationRequired = 511,
}
