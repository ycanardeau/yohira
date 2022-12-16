import { WebApp } from '@yohira/core/default-builder/WebApp';

// https://source.dot.net/#Microsoft.AspNetCore/WebApplicationBuilder.cs,25a352b50e81d95b,references
export class WebAppBuilder {
	build = (): WebApp => {
		return new WebApp(); /* TODO */
	};
}
