import { SameSiteMode as SharedSameSiteMode } from '@yohira/http.shared';

// https://source.dot.net/#Microsoft.Net.Http.Headers/SameSiteMode.cs,3f412ac98c8dcdcc,references
/**
 * Indicates if the client should include a cookie on "same-site" or "cross-site" requests.
 * RFC Draft: <see href="https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.1"/>
 */
// This mirrors Microsoft.AspNetCore.Http.SameSiteMode
export type SameSiteMode = SharedSameSiteMode;
