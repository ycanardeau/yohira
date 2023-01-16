import { IAppBuilder } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostServiceOptions.cs,a0de8a4d4338957a,references
export class GenericWebHostServiceOptions {
	configureApp?: (app: IAppBuilder) => void;
}
