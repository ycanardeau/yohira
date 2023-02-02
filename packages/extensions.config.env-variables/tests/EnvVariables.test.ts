import { ConfigBuilder } from '@yohira/extensions.config';
import { bind, bindProperty } from '@yohira/extensions.config.binder';
import {
	EnvVariablesConfigProvider,
	addEnvVariables,
} from '@yohira/extensions.config.env-variables';
import { env } from 'node:process';
import { expect, test } from 'vitest';

import { get } from '../../extensions.config/tests/common/ConfigProviderExtensions';

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L17
test('LoadKeyValuePairsFromEnvironmentDictionary', async () => {
	const dict = {
		'DefaultConnection:ConnectionString': 'TestConnectionString',
		'DefaultConnection:Provider': 'SqlClient',
		'Inventory:ConnectionString': 'AnotherTestConnectionString',
		'Inventory:Provider': 'MySql',
	};
	const envConfigSrc = new EnvVariablesConfigProvider(undefined);

	await envConfigSrc.loadCore(dict);

	expect(get(envConfigSrc, 'defaultconnection:ConnectionString')).toBe(
		'TestConnectionString',
	);
	expect(get(envConfigSrc, 'DEFAULTCONNECTION:PROVIDER')).toBe('SqlClient');
	expect(get(envConfigSrc, 'Inventory:CONNECTIONSTRING')).toBe(
		'AnotherTestConnectionString',
	);
	expect(get(envConfigSrc, 'Inventory:Provider')).toBe('MySql');
	expect(envConfigSrc.toString()).toBe(
		"EnvVariablesConfigProvider Prefix: ''",
	);
});

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L38
test('LoadKeyValuePairsFromEnvironmentDictionaryWithPrefix', async () => {
	const dict = {
		'DefaultConnection:ConnectionString': 'TestConnectionString',
		'DefaultConnection:Provider': 'SqlClient',
		'Inventory:ConnectionString': 'AnotherTestConnectionString',
		'Inventory:Provider': 'MySql',
	};
	const envConfigSrc = new EnvVariablesConfigProvider('DefaultConnection:');

	await envConfigSrc.loadCore(dict);

	expect(get(envConfigSrc, 'ConnectionString')).toBe('TestConnectionString');
	expect(get(envConfigSrc, 'Provider')).toBe('SqlClient');
	expect(envConfigSrc.toString()).toBe(
		"EnvVariablesConfigProvider Prefix: 'DefaultConnection:'",
	);
});

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L57
test('LoadKeyValuePairsFromAzureEnvironment', async () => {
	const dict = {
		APPSETTING_AppName: 'TestAppName',
		CUSTOMCONNSTR_db1: 'CustomConnStr',
		SQLCONNSTR_db2: 'SQLConnStr',
		MYSQLCONNSTR_db3: 'MySQLConnStr',
		SQLAZURECONNSTR_db4: 'SQLAzureConnStr',
		CommonEnv: 'CommonEnvValue',
	};
	const envConfigSrc = new EnvVariablesConfigProvider(undefined);

	await envConfigSrc.loadCore(dict);

	expect(get(envConfigSrc, 'APPSETTING_AppName')).toBe('TestAppName');
	const tryGetResult = envConfigSrc.tryGet('AppName');
	expect(tryGetResult.ok).toBe(false);
	expect(get(envConfigSrc, 'ConnectionStrings:db1')).toBe('CustomConnStr');
	expect(get(envConfigSrc, 'ConnectionStrings:db2')).toBe('SQLConnStr');
	expect(get(envConfigSrc, 'ConnectionStrings:db2_ProviderName')).toBe(
		'System.Data.SqlClient',
	);
	expect(get(envConfigSrc, 'ConnectionStrings:db3')).toBe('MySQLConnStr');
	expect(get(envConfigSrc, 'ConnectionStrings:db3_ProviderName')).toBe(
		'MySql.Data.MySqlClient',
	);
	expect(get(envConfigSrc, 'ConnectionStrings:db4')).toBe('SQLAzureConnStr');
	expect(get(envConfigSrc, 'ConnectionStrings:db4_ProviderName')).toBe(
		'System.Data.SqlClient',
	);
	expect(get(envConfigSrc, 'CommonEnv')).toBe('CommonEnvValue');
});

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L86
test('LoadKeyValuePairsFromAzureEnvironmentWithPrefix', async () => {
	const dict = {
		CUSTOMCONNSTR_db1: 'CustomConnStr',
		SQLCONNSTR_db2: 'SQLConnStr',
		MYSQLCONNSTR_db3: 'MySQLConnStr',
		SQLAZURECONNSTR_db4: 'SQLAzureConnStr',
		CommonEnv: 'CommonEnvValue',
	};
	const envConfigSrc = new EnvVariablesConfigProvider('ConnectionStrings:');

	await envConfigSrc.loadCore(dict);

	expect(get(envConfigSrc, 'db1')).toBe('CustomConnStr');
	expect(get(envConfigSrc, 'db2')).toBe('SQLConnStr');
	expect(get(envConfigSrc, 'db2_ProviderName')).toBe('System.Data.SqlClient');
	expect(get(envConfigSrc, 'db3')).toBe('MySQLConnStr');
	expect(get(envConfigSrc, 'db3_ProviderName')).toBe(
		'MySql.Data.MySqlClient',
	);
	expect(get(envConfigSrc, 'db4')).toBe('SQLAzureConnStr');
	expect(get(envConfigSrc, 'db4_ProviderName')).toBe('System.Data.SqlClient');
});

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L110
test('LastVariableAddedWhenKeyIsDuplicatedInAzureEnvironment', async () => {
	const dict = {
		'ConnectionStrings:db2': 'CommonEnvValue',
		SQLCONNSTR_db2: 'SQLConnStr',
	};
	const envConfigSrc = new EnvVariablesConfigProvider(undefined);

	await envConfigSrc.loadCore(dict);

	expect(!!get(envConfigSrc, 'ConnectionStrings:db2')).toBe(true);
	expect(get(envConfigSrc, 'ConnectionStrings:db2_ProviderName')).toBe(
		'System.Data.SqlClient',
	);
});

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L126
test('LastVariableAddedWhenMultipleEnvironmentVariablesWithSameNameButDifferentCaseExist', async () => {
	const dict = {
		CommonEnv: 'CommonEnvValue1',
		commonenv: 'commonenvValue2',
		cOMMonEnv: 'commonenvValue3',
	};
	const envConfigSrc = new EnvVariablesConfigProvider(undefined);

	await envConfigSrc.loadCore(dict);

	expect(!!get(envConfigSrc, 'cOMMonEnv')).toBe(true);
	expect(!!get(envConfigSrc, 'CommonEnv')).toBe(true);
});

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L143
test('ReplaceDoubleUnderscoreInEnvironmentVariables', async () => {
	const dict = {
		data__ConnectionString: 'connection',
		SQLCONNSTR_db1: 'connStr',
	};
	const envConfigSrc = new EnvVariablesConfigProvider(undefined);

	await envConfigSrc.loadCore(dict);

	expect(get(envConfigSrc, 'data:ConnectionString')).toBe('connection');
	expect(get(envConfigSrc, 'ConnectionStrings:db1_ProviderName')).toBe(
		'System.Data.SqlClient',
	);
});

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L159
test('ReplaceDoubleUnderscoreInEnvironmentVariablesDoubleUnderscorePrefixStillMatches', async () => {
	const dict = {
		test__prefix__with__double__underscores__data__ConnectionString:
			'connection',
	};
	const envConfigSrc = new EnvVariablesConfigProvider(
		'test__prefix__with__double__underscores__',
	);

	await envConfigSrc.loadCore(dict);

	expect(get(envConfigSrc, 'data:ConnectionString')).toBe('connection');
});

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L173
test('MixingPathSeparatorsInPrefixStillMatchesEnvironmentVariable', async () => {
	const dict = {
		_____EXPERIMENTAL__data__ConnectionString: 'connection',
	};
	const envConfigSrc = new EnvVariablesConfigProvider('::_EXPERIMENTAL:');

	await envConfigSrc.loadCore(dict);

	expect(get(envConfigSrc, 'data:ConnectionString')).toBe('connection');
});

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L187
test('OnlyASinglePrefixIsRemovedFromMatchingKey', async () => {
	const dict = {
		test__test__ConnectionString: 'connection',
	};
	const envConfigSrc = new EnvVariablesConfigProvider('test__');

	await envConfigSrc.loadCore(dict);

	expect(get(envConfigSrc, 'test:ConnectionString')).toBe('connection');
});

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L201
test('OnlyEnvironmentVariablesMatchingTheGivenPrefixAreIncluded', async () => {
	const dict = {
		projectA__section1__project: 'A',
		projectA__section1__projectA: 'true',
		projectB__section1__project: 'B',
		projectB__section1__projectB: 'true',
		section1__project: 'unknown',
		section1__noProject: 'true',
	};
	const envConfigSrc = new EnvVariablesConfigProvider('projectB__');

	await envConfigSrc.loadCore(dict);

	expect(get(envConfigSrc, 'section1:project')).toBe('B');
	expect(get(envConfigSrc, 'section1:projectB')).toBe('true');
	expect(() => get(envConfigSrc, 'section1:projectA')).toThrowError();
	expect(() => get(envConfigSrc, 'section1:noProject')).toThrowError();
});

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L223
test('PrefixPreventsLoadingSqlConnectionStrings', async () => {
	const dict = {
		test__test__ConnectionString: 'connection',
		SQLCONNSTR_db1: 'connStr',
	};
	const envConfigSrc = new EnvVariablesConfigProvider('test:');

	await envConfigSrc.loadCore(dict);

	expect(get(envConfigSrc, 'test:ConnectionString')).toBe('connection');
	expect(() =>
		get(envConfigSrc, 'ConnectionStrings:db1_ProviderName'),
	).toThrowError();
});

const envVariable =
	'Microsoft__Extensions__Configuration__EnvironmentVariables__Test__Foo';
class SettingsWithFoo {
	@bindProperty(String) foo?: string;
}

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L245
test('AddEnvironmentVariablesUsingNormalizedPrefix_Bind_PrefixMatches', async () => {
	try {
		env[envVariable] = 'myFooValue';
		const config = await addEnvVariables(
			new ConfigBuilder(),
			'Microsoft:Extensions:Configuration:EnvironmentVariables:Test:',
		).build();

		const settingsWithFoo = new SettingsWithFoo();
		bind(config, settingsWithFoo);

		expect(settingsWithFoo.foo).toBe('myFooValue');
	} finally {
		env[envVariable] = undefined;
	}
});

// https://github.com/dotnet/runtime/blob/main/src/libraries/Microsoft.Extensions.Configuration.EnvironmentVariables/tests/EnvironmentVariablesTest.cs#L266
test('AddEnvironmentVariablesUsingPrefixWithDoubleUnderscores_Bind_PrefixMatches', async () => {
	try {
		env[envVariable] = 'myFooValue';
		const config = await addEnvVariables(
			new ConfigBuilder(),
			'Microsoft__Extensions__Configuration__EnvironmentVariables__Test__',
		).build();

		const settingsWithFoo = new SettingsWithFoo();
		bind(config, settingsWithFoo);

		expect(settingsWithFoo.foo).toBe('myFooValue');
	} finally {
		env[envVariable] = undefined;
	}
});
