import {
	CaseInsensitiveMap,
	replaceAll,
	startsWithIgnoreCase,
} from '@yohira/base';
import { ConfigProvider } from '@yohira/extensions.config';
import { keyDelimiter } from '@yohira/extensions.config.abstractions';
import { env } from 'node:process';

const mySqlServerPrefix = 'MYSQLCONNSTR_';
const sqlAzureServerPrefix = 'SQLAZURECONNSTR_';
const sqlServerPrefix = 'SQLCONNSTR_';
const customConnectionStringPrefix = 'CUSTOMCONNSTR_';

// https://source.dot.net/#Microsoft.Extensions.Configuration.EnvironmentVariables/EnvironmentVariablesConfigurationProvider.cs,1223d6a411f453bc,references
export class EnvVariablesConfigProvider extends ConfigProvider {
	private readonly prefix: string;
	private readonly normalizedPrefix: string;

	private static normalize(key: string): string {
		// TODO: Replace with string.replaceAll.
		return replaceAll(key, '__', keyDelimiter);
	}

	constructor(prefix: string | undefined) {
		super();
		this.prefix = prefix ?? '';
		this.normalizedPrefix = EnvVariablesConfigProvider.normalize(
			this.prefix,
		);
	}

	private addIfNormalizedKeyMatchesPrefix(
		data: CaseInsensitiveMap<string | undefined>,
		normalizedKey: string,
		value: string | undefined,
	): void {
		if (startsWithIgnoreCase(normalizedKey, this.normalizedPrefix)) {
			data.set(
				normalizedKey.substring(this.normalizedPrefix.length),
				value,
			);
		}
	}

	private handleMatchedConnectionStringPrefix(
		data: CaseInsensitiveMap<string | undefined>,
		connectionStringPrefix: string,
		provider: string | undefined,
		fullKey: string,
		value: string | undefined,
	): void {
		const normalizedKeyWithoutConnectionStringPrefix =
			EnvVariablesConfigProvider.normalize(
				fullKey.substring(connectionStringPrefix.length),
			);

		this.addIfNormalizedKeyMatchesPrefix(
			data,
			`ConnectionStrings:${normalizedKeyWithoutConnectionStringPrefix}`,
			value,
		);
		if (provider !== undefined) {
			this.addIfNormalizedKeyMatchesPrefix(
				data,
				`ConnectionStrings:${normalizedKeyWithoutConnectionStringPrefix}_ProviderName`,
				provider,
			);
		}
	}

	loadCore(envVariables: NodeJS.ProcessEnv): Promise<void> {
		const data = new CaseInsensitiveMap<string | undefined>();

		for (const [key, value] of Object.entries(envVariables)) {
			if (startsWithIgnoreCase(key, mySqlServerPrefix)) {
				this.handleMatchedConnectionStringPrefix(
					data,
					mySqlServerPrefix,
					'MySql.Data.MySqlClient',
					key,
					value,
				);
			} else if (startsWithIgnoreCase(key, sqlAzureServerPrefix)) {
				this.handleMatchedConnectionStringPrefix(
					data,
					sqlAzureServerPrefix,
					'System.Data.SqlClient',
					key,
					value,
				);
			} else if (startsWithIgnoreCase(key, sqlServerPrefix)) {
				this.handleMatchedConnectionStringPrefix(
					data,
					sqlServerPrefix,
					'System.Data.SqlClient',
					key,
					value,
				);
			} else if (
				startsWithIgnoreCase(key, customConnectionStringPrefix)
			) {
				this.handleMatchedConnectionStringPrefix(
					data,
					customConnectionStringPrefix,
					undefined,
					key,
					value,
				);
			} else {
				this.addIfNormalizedKeyMatchesPrefix(
					data,
					EnvVariablesConfigProvider.normalize(key),
					value,
				);
			}
		}

		this.data = data;
		return Promise.resolve();
	}

	load(): Promise<void> {
		return this.loadCore(env);
	}

	toString(): string {
		return `${this.constructor.name} Prefix: '${this.prefix}'`;
	}
}
