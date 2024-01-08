import {
	AntiforgeryFeature,
	AntiforgeryOptions,
	AntiforgeryToken,
	AntiforgeryTokenSet,
	DefaultAntiforgery,
	IAntiforgeryFeature,
	IAntiforgeryTokenGenerator,
	IAntiforgeryTokenSerializer,
	IAntiforgeryTokenStore,
} from '@yohira/antiforgery';
import {
	ClaimsIdentity,
	ClaimsPrincipal,
} from '@yohira/authentication.abstractions';
import { Ctor, IServiceProvider } from '@yohira/base';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	ServiceCollection,
	addSingletonInstance,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import { LoggerFactory } from '@yohira/extensions.logging';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IOptions } from '@yohira/extensions.options';
import { HttpContext } from '@yohira/http';
import {
	CookieBuilder,
	CookieSecurePolicy,
	IHttpContext,
} from '@yohira/http.abstractions';
import { HeaderNames } from '@yohira/http.headers';
import { TestLogger, TestSink } from '@yohira/testing';
import { expect, test } from 'vitest';

const responseCacheHeadersOverrideWarningMessage =
	"The 'Cache-Control' and 'Pragma' headers have been overridden and set to 'no-cache, no-store' and " +
	"'no-cache' respectively to prevent caching of this response. Any response that uses antiforgery " +
	'should not be cached.';

function getServices(): IServiceProvider {
	const builder = new ServiceCollection();
	addSingletonInstance(builder, ILoggerFactory, new LoggerFactory());

	return buildServiceProvider(builder);
}

function getHttpContext(
	antiforgeryFeature?: IAntiforgeryFeature,
): IHttpContext {
	const httpContext = HttpContext.create();
	antiforgeryFeature = antiforgeryFeature ?? new AntiforgeryFeature();
	httpContext.features.set(IAntiforgeryFeature, antiforgeryFeature);
	httpContext.requestServices = getServices();
	httpContext.user = ClaimsPrincipal.fromIdentity(
		new ClaimsIdentity(
			undefined,
			undefined,
			'some-auth',
			undefined,
			undefined,
		),
	);

	return httpContext;
}

class TestOptionsManager implements IOptions<AntiforgeryOptions> {
	private value = new AntiforgeryOptions();

	getValue(optionsCtor: Ctor<AntiforgeryOptions>): AntiforgeryOptions {
		return this.value;
	}
	setValue(
		optionsCtor: Ctor<AntiforgeryOptions>,
		value: AntiforgeryOptions,
	): void {
		this.value = value;
	}
}

function getAntiforgery(
	httpContext: IHttpContext,
	options?: AntiforgeryOptions,
	tokenGenerator?: IAntiforgeryTokenGenerator,
	tokenSerializer?: IAntiforgeryTokenSerializer,
	tokenStore?: IAntiforgeryTokenStore,
): DefaultAntiforgery;
function getAntiforgery(context: AntiforgeryMockContext): DefaultAntiforgery;
function getAntiforgery(
	httpContextOrContext: IHttpContext | AntiforgeryMockContext,
	options?: AntiforgeryOptions,
	tokenGenerator?: IAntiforgeryTokenGenerator,
	tokenSerializer?: IAntiforgeryTokenSerializer,
	tokenStore?: IAntiforgeryTokenStore,
): DefaultAntiforgery {
	if (httpContextOrContext instanceof AntiforgeryMockContext) {
		return getAntiforgery(
			httpContextOrContext.httpContext,
			httpContextOrContext.options,
			httpContextOrContext.tokenGenerator,
			httpContextOrContext.tokenSerializer,
			httpContextOrContext.tokenStore,
		);
	} else {
		const optionsManager = new TestOptionsManager();
		if (options !== undefined) {
			optionsManager.setValue(AntiforgeryOptions, options);
		}

		const loggerFactory = getRequiredService<ILoggerFactory>(
			httpContextOrContext.requestServices,
			ILoggerFactory,
		);
		return new DefaultAntiforgery(
			optionsManager,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			tokenGenerator!,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			tokenSerializer!,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			tokenStore!,
			loggerFactory,
		);
	}
}

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L23C23-L23C60
test('ChecksSSL_ValidateRequestAsync_Throws', async () => {
	const httpContext = getHttpContext();
	const options = new AntiforgeryOptions();
	options.cookie = ((): CookieBuilder => {
		const cookieBuilder = new CookieBuilder();
		cookieBuilder.securePolicy = CookieSecurePolicy.Always;
		return cookieBuilder;
	})();
	const antiforgery = getAntiforgery(httpContext, options);

	await expect(() =>
		antiforgery.validateRequest(httpContext),
	).rejects.toThrowError(
		'The antiforgery system has the configuration value AntiforgeryOptions.cookie.securePolicy = Always, ' +
			'but the current request is not an SSL request.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L46C23-L46C59
test('ChecksSSL_IsRequestValidAsync_Throws', async () => {
	const httpContext = getHttpContext();
	const options = ((): AntiforgeryOptions => {
		const options = new AntiforgeryOptions();
		options.cookie = ((): CookieBuilder => {
			const cookieBuilder = new CookieBuilder();
			cookieBuilder.securePolicy = CookieSecurePolicy.Always;
			return cookieBuilder;
		})();
		return options;
	})();

	const antiforgery = getAntiforgery(httpContext, options);

	await expect(() =>
		antiforgery.isRequestValid(httpContext),
	).rejects.toThrowError(
		'The antiforgery system has the configuration value AntiforgeryOptions.cookie.securePolicy = Always, ' +
			'but the current request is not an SSL request.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L67C17-L67C51
test('ChecksSSL_GetAndStoreTokens_Throws', () => {
	const httpContext = getHttpContext();
	const options = ((): AntiforgeryOptions => {
		const options = new AntiforgeryOptions();
		options.cookie = ((): CookieBuilder => {
			const cookieBuilder = new CookieBuilder();
			cookieBuilder.securePolicy = CookieSecurePolicy.Always;
			return cookieBuilder;
		})();
		return options;
	})();

	const antiforgery = getAntiforgery(httpContext, options);

	expect(() => antiforgery.getAndStoreTokens(httpContext)).toThrowError(
		'The antiforgery system has the configuration value AntiforgeryOptions.cookie.securePolicy = Always, ' +
			'but the current request is not an SSL request.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L88C17-L88C43
test('ChecksSSL_GetTokens_Throws', () => {
	const httpContext = getHttpContext();
	const options = ((): AntiforgeryOptions => {
		const options = new AntiforgeryOptions();
		options.cookie = ((): CookieBuilder => {
			const cookieBuilder = new CookieBuilder();
			cookieBuilder.securePolicy = CookieSecurePolicy.Always;
			return cookieBuilder;
		})();
		return options;
	})();

	const antiforgery = getAntiforgery(httpContext, options);

	expect(() => antiforgery.getTokens(httpContext)).toThrowError(
		'The antiforgery system has the configuration value AntiforgeryOptions.cookie.securePolicy = Always, ' +
			'but the current request is not an SSL request.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L109C17-L109C57
test('ChecksSSL_SetCookieTokenAndHeader_Throws', () => {
	const httpContext = getHttpContext();
	const options = ((): AntiforgeryOptions => {
		const options = new AntiforgeryOptions();
		options.cookie = ((): CookieBuilder => {
			const cookieBuilder = new CookieBuilder();
			cookieBuilder.securePolicy = CookieSecurePolicy.Always;
			return cookieBuilder;
		})();
		return options;
	})();

	const antiforgery = getAntiforgery(httpContext, options);

	expect(() => antiforgery.setCookieTokenAndHeader(httpContext)).toThrowError(
		'The antiforgery system has the configuration value AntiforgeryOptions.cookie.securePolicy = Always, ' +
			'but the current request is not an SSL request.',
	);
});

class TestTokenSet {
	requestToken!: AntiforgeryToken;
	formTokenString!: string;
	oldCookieToken!: AntiforgeryToken;
	oldCookieTokenString!: string;
	newCookieToken!: AntiforgeryToken;
	newCookieTokenString!: string;
}

class AntiforgeryMockContext {
	options!: AntiforgeryOptions;
	testTokenSet!: TestTokenSet;
	httpContext!: IHttpContext;
	tokenGenerator!: IAntiforgeryTokenGenerator;
	tokenStore!: IAntiforgeryTokenStore;
	tokenSerializer!: IAntiforgeryTokenSerializer;
}

function getTokenSet(): TestTokenSet {
	return ((): TestTokenSet => {
		const testTokenSet = new TestTokenSet();
		testTokenSet.requestToken = ((): AntiforgeryToken => {
			const token = new AntiforgeryToken();
			token.isCookieToken = false;
			return token;
		})();
		testTokenSet.formTokenString = 'serialized-form-token';
		testTokenSet.oldCookieToken = ((): AntiforgeryToken => {
			const token = new AntiforgeryToken();
			token.isCookieToken = true;
			return token;
		})();
		testTokenSet.oldCookieTokenString = 'serialized-old-cookie-token';
		testTokenSet.newCookieToken = ((): AntiforgeryToken => {
			const token = new AntiforgeryToken();
			token.isCookieToken = true;
			return token;
		})();
		testTokenSet.newCookieTokenString = 'serialized-new-cookie-token';
		return testTokenSet;
	})();
}

function getTokenSerializer(
	testTokenSet: TestTokenSet,
): IAntiforgeryTokenSerializer {
	const oldCookieToken = testTokenSet.oldCookieToken;
	const newCookieToken = testTokenSet.newCookieToken;
	const formToken = testTokenSet.requestToken;
	const mockSerializer: IAntiforgeryTokenSerializer = {
		serialize: (...args) => {
			if (args[0] === formToken) {
				return testTokenSet.formTokenString;
			} else if (args[0] === oldCookieToken) {
				return testTokenSet.oldCookieTokenString;
			} else if (args[0] === newCookieToken) {
				return testTokenSet.newCookieTokenString;
			} else {
				throw new Error(/* TODO: message */);
			}
		},
		deserialize: (...args) => {
			if (args[0] === testTokenSet.formTokenString) {
				return formToken;
			} else if (args[0] === testTokenSet.oldCookieTokenString) {
				return oldCookieToken;
			} else {
				throw new Error(/* TODO: message */);
			}
		},
		// TODO
	};
	return mockSerializer;
}

function getTokenStore(
	context: IHttpContext,
	testTokenSet: TestTokenSet,
	saveNewCookie = true,
): IAntiforgeryTokenStore {
	const oldCookieToken = testTokenSet.oldCookieTokenString;
	const formToken = testTokenSet.formTokenString;
	const mockTokenStore: IAntiforgeryTokenStore = {
		getCookieToken: (...args) => {
			if (args[0] === context) {
				return oldCookieToken;
			} else {
				throw new Error(/* TODO: message */);
			}
		},

		getRequestTokens: (...args) => {
			if (args[0] === context) {
				return Promise.resolve(
					new AntiforgeryTokenSet(
						formToken,
						oldCookieToken,
						'form',
						'header',
					),
				);
			} else {
				throw new Error(/* TODO: message */);
			}
		},

		// REVIEW
		saveCookieToken: () => {},
	};

	if (saveNewCookie) {
		const newCookieToken = testTokenSet.newCookieTokenString;
		// TODO
	}

	return mockTokenStore;
}

function createMockContext(
	options: AntiforgeryOptions,
	useOldCookie = false,
	isOldCookieValid = true,
	antiforgeryFeature?: IAntiforgeryFeature,
): AntiforgeryMockContext {
	const httpContext = getHttpContext(antiforgeryFeature);
	const testTokenSet = getTokenSet();

	const mockSerializer = getTokenSerializer(testTokenSet);

	const mockTokenStore = getTokenStore(
		httpContext,
		testTokenSet,
		!useOldCookie,
	);

	const mockGenerator: IAntiforgeryTokenGenerator = {
		generateRequestToken: (...args) => {
			if (
				args[0] === httpContext &&
				args[1] ===
					(useOldCookie
						? testTokenSet.oldCookieToken
						: testTokenSet.newCookieToken)
			) {
				return testTokenSet.requestToken;
			} else {
				throw new Error(/* TODO: message */);
			}
		},

		generateCookieToken: () => {
			return useOldCookie
				? testTokenSet.oldCookieToken
				: testTokenSet.newCookieToken;
		},

		isCookieTokenValid: (...args) => {
			if (args[0] === undefined) {
				return false;
			} else if (args[0] === testTokenSet.oldCookieToken) {
				return isOldCookieValid;
			} else if (args[0] === testTokenSet.newCookieToken) {
				return !isOldCookieValid;
			} else {
				throw new Error(/* TODO: message */);
			}
		},

		// TODO
	};

	return ((): AntiforgeryMockContext => {
		const mockContext = new AntiforgeryMockContext();
		mockContext.options = options;
		mockContext.httpContext = httpContext;
		mockContext.tokenGenerator = mockGenerator;
		mockContext.tokenSerializer = mockSerializer;
		mockContext.tokenStore = mockTokenStore;
		mockContext.testTokenSet = testTokenSet;
		return mockContext;
	})();
}

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L130C17-L130C94
test('GetTokens_ExistingInvalidCookieToken_GeneratesANewCookieTokenAndANewFormToken', () => {
	const antiforgeryFeature = new AntiforgeryFeature();
	const context = createMockContext(
		new AntiforgeryOptions(),
		false,
		false,
		antiforgeryFeature,
	);
	const antiforgery = getAntiforgery(context);

	const tokenset = antiforgery.getTokens(context.httpContext);

	expect(tokenset.cookieToken).toBe(
		context.testTokenSet.newCookieTokenString,
	);
	expect(tokenset.requestToken).toBe(context.testTokenSet.formTokenString);

	expect(antiforgeryFeature).not.toBeUndefined();
	expect(antiforgeryFeature.haveDeserializedCookieToken).toBe(true);
	expect(antiforgeryFeature.cookieToken).toBe(
		context.testTokenSet.oldCookieToken,
	);
	expect(antiforgeryFeature.haveGeneratedNewCookieToken).toBe(true);
	expect(antiforgeryFeature.newCookieToken).toBe(
		context.testTokenSet.newCookieToken,
	);
	expect(antiforgeryFeature.newCookieTokenString).toBe(
		context.testTokenSet.newCookieTokenString,
	);
	expect(antiforgeryFeature.newRequestToken).toBe(
		context.testTokenSet.requestToken,
	);
	expect(antiforgeryFeature.newRequestTokenString).toBe(
		context.testTokenSet.formTokenString,
	);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L160C17-L160C72
test('GetTokens_ExistingInvalidCookieToken_SwallowsExceptions', () => {
	const context = createMockContext(new AntiforgeryOptions(), false, false);

	const { tokenSerializer, tokenGenerator } = context;
	context.tokenSerializer = {
		...tokenSerializer,
		deserialize: (...args): AntiforgeryToken => {
			throw new Error('should be swallowed');
		},
	};
	context.tokenGenerator = {
		...tokenGenerator,
		isCookieTokenValid: (...args): boolean => {
			if (args[0] === undefined) {
				return false;
			} else {
				return tokenGenerator.isCookieTokenValid(...args);
			}
		},
	};

	const antiforgery = getAntiforgery(context);

	const tokenset = antiforgery.getTokens(context.httpContext);

	expect(tokenset.cookieToken).toBe(
		context.testTokenSet.newCookieTokenString,
	);
	expect(tokenset.requestToken).toBe(context.testTokenSet.formTokenString);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L188C17-L188C74
test('GetTokens_ExistingValidCookieToken_GeneratesANewFormToken', () => {
	const antiforgeryFeature = new AntiforgeryFeature();
	const context = createMockContext(
		new AntiforgeryOptions(),
		true,
		true,
		antiforgeryFeature,
	);
	const antiforgery = getAntiforgery(context);

	const tokenset = antiforgery.getTokens(context.httpContext);

	expect(tokenset.cookieToken).toBeUndefined();
	expect(tokenset.requestToken).toBe(context.testTokenSet.formTokenString);

	expect(antiforgeryFeature).not.toBeUndefined();
	expect(antiforgeryFeature.haveDeserializedCookieToken).toBe(true);
	expect(antiforgeryFeature.cookieToken).toBe(
		context.testTokenSet.oldCookieToken,
	);
	expect(antiforgeryFeature.haveGeneratedNewCookieToken).toBe(true);
	expect(antiforgeryFeature.newCookieToken).toBeUndefined();
	expect(antiforgeryFeature.newRequestToken).toBe(
		context.testTokenSet.requestToken,
	);
	expect(antiforgeryFeature.newRequestTokenString).toBe(
		context.testTokenSet.formTokenString,
	);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L216C17-L216C48
test('GetTokens_DoesNotSerializeTwice', () => {
	const antiforgeryFeature = ((): AntiforgeryFeature => {
		const antiforgeryFeature = new AntiforgeryFeature();
		antiforgeryFeature.haveDeserializedCookieToken = true;
		antiforgeryFeature.haveGeneratedNewCookieToken = true;
		antiforgeryFeature.newRequestToken = new AntiforgeryToken();
		antiforgeryFeature.newRequestTokenString =
			'serialized-form-token-from-context';
		return antiforgeryFeature;
	})();
	const context = createMockContext(
		new AntiforgeryOptions(),
		true,
		true,
		antiforgeryFeature,
	);

	const antiforgery = getAntiforgery(context);

	const tokenset = antiforgery.getTokens(context.httpContext);

	expect(tokenset.cookieToken).toBeUndefined();
	expect(tokenset.requestToken).toBe('serialized-form-token-from-context');

	expect(antiforgeryFeature.newCookieToken).toBeUndefined();

	// Token serializer not used.
	// TODO
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L253C17-L253C72
test('GetAndStoreTokens_ExistingValidCookieToken_NotOverriden', () => {
	const antiforgeryFeature = new AntiforgeryFeature();
	const context = createMockContext(
		new AntiforgeryOptions(),
		true,
		true,
		antiforgeryFeature,
	);
	const antiforgery = getAntiforgery(context);

	const tokenSet = antiforgery.getAndStoreTokens(context.httpContext);

	// We shouldn't have saved the cookie because it already existed.
	// TODO

	expect(tokenSet.cookieToken).toBeUndefined();
	expect(tokenSet.requestToken).toBe(context.testTokenSet.formTokenString);

	expect(antiforgeryFeature).not.toBeUndefined();
	expect(antiforgeryFeature.haveDeserializedCookieToken).toBe(true);
	expect(antiforgeryFeature.cookieToken).toBe(
		context.testTokenSet.oldCookieToken,
	);
	expect(antiforgeryFeature.haveGeneratedNewCookieToken).toBe(true);
	expect(antiforgeryFeature.newCookieToken).toBeUndefined();
	expect(antiforgeryFeature.newRequestToken).toBe(
		context.testTokenSet.requestToken,
	);
	expect(antiforgeryFeature.newRequestTokenString).toBe(
		context.testTokenSet.formTokenString,
	);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L286C17-L286C97
test('GetAndStoreTokens_ExistingValidCookieToken_NotOverriden_AndSetsDoNotCacheHeaders', () => {
	const antiforgeryFeature = new AntiforgeryFeature();
	const context = createMockContext(
		new AntiforgeryOptions(),
		true,
		true,
		antiforgeryFeature,
	);
	const antiforgery = getAntiforgery(context);

	const tokenSet = antiforgery.getAndStoreTokens(context.httpContext);

	// We shouldn't have saved the cookie because it already existed.
	// TODO

	expect(tokenSet.cookieToken).toBeUndefined();
	expect(tokenSet.requestToken).toBe(context.testTokenSet.formTokenString);

	expect(antiforgeryFeature).not.toBeUndefined();
	expect(antiforgeryFeature.cookieToken).toBe(
		context.testTokenSet.oldCookieToken,
	);
	expect(
		context.httpContext.response.headers.getHeader(
			HeaderNames['Cache-Control'],
		),
	).toBe('no-cache, no-store');
	expect(
		context.httpContext.response.headers.getHeader(HeaderNames.Pragma),
	).toBe('no-cache');
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L316C17-L316C67
test('GetAndStoreTokens_ExistingCachingHeaders_Overriden', () => {
	const antiforgeryFeature = new AntiforgeryFeature();
	const context = createMockContext(
		new AntiforgeryOptions(),
		true,
		true,
		antiforgeryFeature,
	);
	const antiforgery = getAntiforgery(context);
	context.httpContext.response.headers.setHeader(
		HeaderNames['Cache-Control'],
		'public',
	);

	const tokenSet = antiforgery.getAndStoreTokens(context.httpContext);

	// We shouldn't have saved the cookie because it already existed.
	// TODO

	expect(tokenSet.cookieToken).toBeUndefined();
	expect(tokenSet.requestToken).toBe(context.testTokenSet.formTokenString);

	expect(antiforgeryFeature).not.toBeUndefined();
	expect(antiforgeryFeature.cookieToken).toBe(
		context.testTokenSet.oldCookieToken,
	);
	expect(
		context.httpContext.response.headers.getHeader(
			HeaderNames['Cache-Control'],
		),
	).toBe('no-cache, no-store');
	expect(
		context.httpContext.response.headers.getHeader(HeaderNames.Pragma),
	).toBe('no-cache');
});

function GetAndStoreTokens_CacheHeadersArrangeAct(
	testSink: TestSink,
	headerName: HeaderNames,
	headerValue: string,
): string | undefined {
	const loggerFactory = {
		createLogger: (categoryName): ILogger =>
			new TestLogger('test logger', testSink, true),
	} as ILoggerFactory;
	const services = new ServiceCollection();
	addSingletonInstance(services, ILoggerFactory, loggerFactory);
	const antiforgeryFeature = new AntiforgeryFeature();
	const context = createMockContext(
		new AntiforgeryOptions(),
		true,
		true,
		antiforgeryFeature,
	);
	context.httpContext.requestServices = buildServiceProvider(services);
	const antiforgery = getAntiforgery(context);
	context.httpContext.response.headers.setHeader(headerName, headerValue);

	antiforgery.getAndStoreTokens(context.httpContext);
	return context.httpContext.response.headers
		.getHeader(headerName)
		?.toString();
}

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L375C17-L375C69
test('GetAndStoreTokens_DoesNotOverwriteCacheControlHeader', () => {
	function GetAndStoreTokens_DoesNotOverwriteCacheControlHeader(
		headerName: HeaderNames,
		headerValue: string,
	): void {
		const testSink = new TestSink();
		const actualHeaderValue = GetAndStoreTokens_CacheHeadersArrangeAct(
			testSink,
			headerName,
			headerValue,
		);

		expect(actualHeaderValue).toBe(headerValue);

		const hasWarningMessage = testSink.writes
			.filter((wc) => wc.logLevel === LogLevel.Warning)
			.map((wc) => wc.state?.toString())
			.includes(responseCacheHeadersOverrideWarningMessage);
		expect(hasWarningMessage).toBe(false);
	}

	GetAndStoreTokens_DoesNotOverwriteCacheControlHeader(
		HeaderNames['Cache-Control'],
		'no-cache, no-store',
	);
	GetAndStoreTokens_DoesNotOverwriteCacheControlHeader(
		HeaderNames['Cache-Control'],
		'NO-CACHE, NO-STORE',
	);
	GetAndStoreTokens_DoesNotOverwriteCacheControlHeader(
		HeaderNames['Cache-Control'],
		'no-cache, no-store, private',
	);
	GetAndStoreTokens_DoesNotOverwriteCacheControlHeader(
		HeaderNames['Cache-Control'],
		'NO-CACHE, NO-STORE, PRIVATE',
	);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L393C17-L393C81
test('GetAndStoreTokens_OverwritesCacheControlHeader_IfNoStoreIsNotSet', () => {
	function GetAndStoreTokens_OverwritesCacheControlHeader_IfNoStoreIsNotSet(
		headerName: HeaderNames,
		headerValue: string,
	): void {
		const testSink = new TestSink();
		const actualHeaderValue = GetAndStoreTokens_CacheHeadersArrangeAct(
			testSink,
			headerName,
			headerValue,
		);

		expect(actualHeaderValue).not.toBe(headerValue);

		const hasWarningMessage = testSink.writes
			.filter((wc) => wc.logLevel === LogLevel.Warning)
			.map((wc) => wc.state?.toString())
			.includes(responseCacheHeadersOverrideWarningMessage);
		expect(hasWarningMessage).toBe(true);
	}

	GetAndStoreTokens_OverwritesCacheControlHeader_IfNoStoreIsNotSet(
		HeaderNames['Cache-Control'],
		'no-cache, private',
	);
	GetAndStoreTokens_OverwritesCacheControlHeader_IfNoStoreIsNotSet(
		HeaderNames['Cache-Control'],
		'NO-CACHE, PRIVATE',
	);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L411C17-L411C81
test('GetAndStoreTokens_OverwritesCacheControlHeader_IfNoCacheIsNotSet', () => {
	function GetAndStoreTokens_OverwritesCacheControlHeader_IfNoCacheIsNotSet(
		headerName: HeaderNames,
		headerValue: string,
	): void {
		const testSink = new TestSink();
		const actualHeaderValue = GetAndStoreTokens_CacheHeadersArrangeAct(
			testSink,
			headerName,
			headerValue,
		);

		expect(actualHeaderValue).not.toBe(headerValue);

		const hasWarningMessage = testSink.writes
			.filter((wc) => wc.logLevel === LogLevel.Warning)
			.map((wc) => wc.state?.toString())
			.includes(responseCacheHeadersOverrideWarningMessage);
		expect(hasWarningMessage).toBe(true);
	}

	GetAndStoreTokens_OverwritesCacheControlHeader_IfNoCacheIsNotSet(
		HeaderNames['Cache-Control'],
		'no-store, private',
	);
	GetAndStoreTokens_OverwritesCacheControlHeader_IfNoCacheIsNotSet(
		HeaderNames['Cache-Control'],
		'NO-STORE, PRIVATE',
	);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L429C17-L429C63
test('GetAndStoreTokens_DoesNotOverwritePragmaHeader', () => {
	function GetAndStoreTokens_DoesNotOverwritePragmaHeader(
		headerName: HeaderNames,
		headerValue: string,
	): void {
		const testSink = new TestSink();
		const actualHeaderValue = GetAndStoreTokens_CacheHeadersArrangeAct(
			testSink,
			headerName,
			headerValue,
		);

		expect(actualHeaderValue).toBe(headerValue);

		const hasWarningMessage = testSink.writes
			.filter((wc) => wc.logLevel === LogLevel.Warning)
			.map((wc) => wc.state?.toString())
			.includes(responseCacheHeadersOverrideWarningMessage);
		expect(hasWarningMessage).toBe(false);
	}

	GetAndStoreTokens_DoesNotOverwritePragmaHeader(
		HeaderNames.Pragma,
		'no-cache',
	);
	GetAndStoreTokens_DoesNotOverwritePragmaHeader(
		HeaderNames.Pragma,
		'NO-CACHE',
	);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L445C17-L445C62
test('GetAndStoreTokens_NoExistingCookieToken_Saved', () => {
	const antiforgeryFeature = new AntiforgeryFeature();
	const context = createMockContext(
		new AntiforgeryOptions(),
		false,
		false,
		antiforgeryFeature,
	);
	const antiforgery = getAntiforgery(context);

	const tokenSet = antiforgery.getAndStoreTokens(context.httpContext);

	// TODO

	expect(tokenSet.cookieToken).toBe(
		context.testTokenSet.newCookieTokenString,
	);
	expect(tokenSet.requestToken).toBe(context.testTokenSet.formTokenString);

	expect(antiforgeryFeature).not.toBeUndefined();
	expect(antiforgeryFeature.haveDeserializedCookieToken).toBe(true);
	expect(antiforgeryFeature.cookieToken).toBe(
		context.testTokenSet.oldCookieToken,
	);
	expect(antiforgeryFeature.haveGeneratedNewCookieToken).toBe(true);
	expect(antiforgeryFeature.newCookieToken).toBe(
		context.testTokenSet.newCookieToken,
	);
	expect(antiforgeryFeature.newCookieTokenString).toBe(
		context.testTokenSet.newCookieTokenString,
	);
	expect(antiforgeryFeature.newRequestToken).toBe(
		context.testTokenSet.requestToken,
	);
	expect(antiforgeryFeature.newRequestTokenString).toBe(
		context.testTokenSet.formTokenString,
	);
	expect(antiforgeryFeature.haveStoredNewCookieToken).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L479C17-L479C87
test('GetAndStoreTokens_NoExistingCookieToken_Saved_AndSetsDoNotCacheHeaders', () => {
	const antiforgeryFeature = new AntiforgeryFeature();
	const context = createMockContext(
		new AntiforgeryOptions(),
		false,
		false,
		antiforgeryFeature,
	);
	const antiforgery = getAntiforgery(context);

	const tokenSet = antiforgery.getAndStoreTokens(context.httpContext);

	// TODO

	expect(tokenSet.cookieToken).toBe(
		context.testTokenSet.newCookieTokenString,
	);
	expect(tokenSet.requestToken).toBe(context.testTokenSet.formTokenString);

	expect(antiforgeryFeature).not.toBeUndefined();
	expect(antiforgeryFeature.haveDeserializedCookieToken).toBe(true);
	expect(antiforgeryFeature.cookieToken).toBe(
		context.testTokenSet.oldCookieToken,
	);
	expect(
		context.httpContext.response.headers.getHeader(
			HeaderNames['Cache-Control'],
		),
	).toBe('no-cache, no-store');
	expect(
		context.httpContext.response.headers.getHeader(HeaderNames.Pragma),
	).toBe('no-cache');
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L509C17-L509C56
test('GetAndStoreTokens_DoesNotSerializeTwice', () => {
	const antiforgeryFeature = ((): AntiforgeryFeature => {
		const antiforgeryFeature = new AntiforgeryFeature();
		antiforgeryFeature.haveDeserializedCookieToken = true;
		antiforgeryFeature.haveGeneratedNewCookieToken = true;
		antiforgeryFeature.newCookieToken = new AntiforgeryToken();
		antiforgeryFeature.newCookieTokenString =
			'serialized-cookie-token-from-context';
		antiforgeryFeature.newRequestToken = new AntiforgeryToken();
		antiforgeryFeature.newRequestTokenString =
			'serialized-form-token-from-context';
		return antiforgeryFeature;
	})();
	const context = createMockContext(
		new AntiforgeryOptions(),
		true,
		true,
		antiforgeryFeature,
	);
	const antiforgery = getAntiforgery(context);

	// TODO

	const tokenset = antiforgery.getAndStoreTokens(context.httpContext);

	// TODO

	// TODO

	expect(tokenset.cookieToken).toBe('serialized-cookie-token-from-context');
	expect(tokenset.requestToken).toBe('serialized-form-token-from-context');

	expect(antiforgeryFeature.haveStoredNewCookieToken).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Antiforgery/test/DefaultAntiforgeryTest.cs#L557C17-L557C52
test('GetAndStoreTokens_DoesNotStoreTwice', () => {
	const antiforgeryFeature = ((): AntiforgeryFeature => {
		const antiforgeryFeature = new AntiforgeryFeature();
		antiforgeryFeature.haveDeserializedCookieToken = true;
		antiforgeryFeature.haveGeneratedNewCookieToken = true;
		antiforgeryFeature.haveStoredNewCookieToken = true;
		antiforgeryFeature.newCookieToken = new AntiforgeryToken();
		antiforgeryFeature.newCookieTokenString =
			'serialized-cookie-token-from-context';
		antiforgeryFeature.newRequestToken = new AntiforgeryToken();
		antiforgeryFeature.newRequestTokenString =
			'serialized-form-token-from-context';
		return antiforgeryFeature;
	})();
	const context = createMockContext(
		new AntiforgeryOptions(),
		true,
		true,
		antiforgeryFeature,
	);
	const antiforgery = getAntiforgery(context.httpContext);

	const tokenset = antiforgery.getAndStoreTokens(context.httpContext);

	// TODO

	// TODO

	expect(tokenset.cookieToken).toBe('serialized-cookie-token-from-context');
	expect(tokenset.requestToken).toBe('serialized-form-token-from-context');
});

// TODO
