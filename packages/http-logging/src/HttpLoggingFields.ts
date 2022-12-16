// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingFields.cs,25a11615fdc00d78,references
export enum HttpLoggingFields {
	None = 0x0,
	RequestPath = 0x1,
	RequestQuery = 0x2,
	RequestProtocol = 0x4,
	RequestMethod = 0x8,
	RequestScheme = 0x10,
	ResponseStatusCode = 0x20,
	RequestHeaders = 0x40,
	ResponseHeaders = 0x80,
	RequestTrailers = 0x100,
	ResponseTrailers = 0x200,
	RequestBody = 0x400,
	ResponseBody = 0x800,
	RequestProperties = RequestPath |
		RequestProtocol |
		RequestMethod |
		RequestScheme,
	RequestPropertiesAndHeaders = RequestProperties | RequestHeaders,
	ResponsePropertiesAndHeaders = ResponseStatusCode | ResponseHeaders,
	Request = RequestPropertiesAndHeaders | RequestBody,
	Response = ResponseStatusCode | ResponseHeaders | ResponseBody,
	All = Request | Response,
}
