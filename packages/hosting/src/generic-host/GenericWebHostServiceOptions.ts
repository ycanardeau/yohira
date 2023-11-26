import { IAppBuilder } from '@yohira/http.abstractions';

import { WebHostOptions } from '../internal/WebHostOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostServiceOptions.cs,a0de8a4d4338957a,references
export class GenericWebHostServiceOptions {
	configureApp: ((app: IAppBuilder) => void) | undefined;
	webHostOptions!: WebHostOptions; // Always set when options resolved by DI
}
