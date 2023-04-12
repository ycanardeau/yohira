import { IKey } from '../IKey';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/Internal/DefaultKeyResolution.cs,abed1ce26987f580,references
export class DefaultKeyResolution {
	defaultKey?: IKey;
	fallbackKey?: IKey;
	shouldGenerateNewKey = false;
}
