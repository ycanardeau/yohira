import { IAppBuilderFactory } from '@yohira/hosting/builder/IAppBuilderFactory';
import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';
import { AppBuilder } from '@yohira/http/builder/AppBuilder';
import { injectable } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Builder/ApplicationBuilderFactory.cs,21990cbf6d36c613,references
@injectable()
export class AppBuilderFactory implements IAppBuilderFactory {
	createBuilder = (): IAppBuilder => {
		return new AppBuilder(/* TODO */);
	};
}
