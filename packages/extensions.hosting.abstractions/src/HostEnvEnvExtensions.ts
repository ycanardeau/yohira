import { Envs } from './Envs';
import { IHostEnv } from './IHostEnv';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostEnvironmentEnvExtensions.cs,fea784c9bbb70c60,references
export function isEnvironment(hostEnv: IHostEnv, envName: string): boolean {
	return hostEnv.envName.toLowerCase() === envName.toLowerCase();
}

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostEnvironmentEnvExtensions.cs,7b43b7392a224997,references
export function isDevelopment(hostEnv: IHostEnv): boolean {
	return isEnvironment(hostEnv, Envs.Development);
}
