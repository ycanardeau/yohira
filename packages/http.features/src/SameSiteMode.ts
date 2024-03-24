import { SameSiteMode as SharedSameSiteMode } from '@yohira/http.shared';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/SameSiteMode.cs,e7684c6570e08b22,references
/**
 * Used to set the SameSite field on response cookies to indicate if those cookies should be included by the client on future "same-site" or "cross-site" requests.
 * RFC Draft: <see href="https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.1"/>
 */
// This mirrors Microsoft.Net.Http.Headers.SameSiteMode
export type SameSiteMode = SharedSameSiteMode;
