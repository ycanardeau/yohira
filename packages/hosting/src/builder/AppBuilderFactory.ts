import { AppBuilder } from '@yohira/http';
import { IAppBuilder } from '@yohira/http.abstractions';

import { IAppBuilderFactory } from '../builder/IAppBuilderFactory';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Builder/ApplicationBuilderFactory.cs,21990cbf6d36c613,references
export class AppBuilderFactory implements IAppBuilderFactory {
	createBuilder(): IAppBuilder {
		return new AppBuilder(/* TODO */);
	}
}
