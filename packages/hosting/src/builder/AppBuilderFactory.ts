import { IAppBuilderFactory } from '@/builder/IAppBuilderFactory';
import { AppBuilder } from '@yohira/http';
import { IAppBuilder } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Builder/ApplicationBuilderFactory.cs,21990cbf6d36c613,references
export class AppBuilderFactory implements IAppBuilderFactory {
	createBuilder(): IAppBuilder {
		return new AppBuilder(/* TODO */);
	}
}
