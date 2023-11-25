import { IHttpApp } from '@yohira/hosting.server.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.TestHost/ApplicationWrapper.cs,189b65a63e92f6c9,references
export abstract class AppWrapperBase {}

// https://source.dot.net/#Microsoft.AspNetCore.TestHost/ApplicationWrapper.cs,77f0b65a445ad5e9,references
export class AppWrapper<TContext> extends AppWrapperBase {
	constructor(
		private readonly app: IHttpApp<TContext>,
		private readonly preProcessRequestAsync: () => void,
	) {
		super();
	}
}
