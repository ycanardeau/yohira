import { Envs } from './Envs';
import { IHostEnv } from './IHostEnv';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostEnvironmentEnvExtensions.cs,fea784c9bbb70c60,references
/**
 * Compares the current host environment name against the specified value.
 * @param hostEnv An instance of {@link IHostEnv}.
 * @param envName Environment name to validate against.
 * @returns True if the specified name is the same as the current environment, otherwise false.
 */
export function isEnv(hostEnv: IHostEnv, envName: string): boolean {
	return hostEnv.envName.toLowerCase() === envName.toLowerCase();
}

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostEnvironmentEnvExtensions.cs,7b43b7392a224997,references
/**
 * Checks if the current host environment name is {@link Envs.Development}.
 * @param hostEnv An instance of {@link IHostEnv}.
 * @returns True if the environment name is {@link Envs.Development}, otherwise false.
 */
export function isDevelopment(hostEnv: IHostEnv): boolean {
	return isEnv(hostEnv, Envs.Development);
}

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostEnvironmentEnvExtensions.cs,fea784c9bbb70c60,references
/**
 * Checks if the current host environment name is {@link Envs.Staging}.
 * @param hostEnv An instance of {@link IHostEnv}.
 * @returns True if the environment name is {@link Envs.Staging}, otherwise false.
 */
export function isStaging(hostEnv: IHostEnv): boolean {
	return isEnv(hostEnv, Envs.Staging);
}

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostEnvironmentEnvExtensions.cs,eea10e6a7e146ad2,references
/**
 * Checks if the current host environment name is {@link Envs.Production}.
 * @param hostEnv An instance of {@link IHostEnv}.
 * @returns True if the environment name is {@link Envs.Production}, otherwise false.
 */
export function isProduction(hostEnv: IHostEnv): boolean {
	return isEnv(hostEnv, Envs.Production);
}
