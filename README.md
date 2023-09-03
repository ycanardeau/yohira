# Yohira

Yohira is an experimental project to port ASP.NET Core to TypeScript.

## Installation

```
npm i yohira
```

## [Dependency Injection](https://github.com/ycanardeau/yohira/tree/main/packages/extensions.dependency-injection)

This is a TypeScript port of [`Microsoft.Extensions.DependencyInjection`](https://www.nuget.org/packages/Microsoft.Extensions.DependencyInjection/).

### Add interfaces

```ts
import { ServiceLifetime } from 'yohira';

interface IReportServiceLifetime {
    readonly id: string;
    readonly lifetime: ServiceLifetime;
}

const IExampleTransientService = Symbol.for('IExampleTransientService');
interface IExampleTransientService extends IReportServiceLifetime {
    readonly lifetime: ServiceLifetime.Transient;
}

const IExampleScopedService = Symbol.for('IExampleScopedService');
interface IExampleScopedService extends IReportServiceLifetime {
    readonly lifetime: ServiceLifetime.Scoped;
}

const IExampleSingletonService = Symbol.for('IExampleSingletonService');
interface IExampleSingletonService extends IReportServiceLifetime {
    readonly lifetime: ServiceLifetime.Singleton;
}
```

### Add default implementations

```ts
import { randomUUID } from 'node:crypto';

class ExampleTransientService implements IExampleTransientService {
    readonly id = randomUUID();
    readonly lifetime = ServiceLifetime.Transient;
}

class ExampleScopedService implements IExampleScopedService {
    readonly id = randomUUID();
    readonly lifetime = ServiceLifetime.Scoped;
}

class ExampleSingletonService implements IExampleSingletonService {
    readonly id = randomUUID();
    readonly lifetime = ServiceLifetime.Singleton;
}
```

### Add a service that requires DI

```ts
import { inject } from 'yohira';

function logService<T extends IReportServiceLifetime>(
    name: symbol,
    service: T,
    message: string,
): void {
    console.log(`    ${Symbol.keyFor(name)}: ${service.id} (${message})`);
}

class ServiceLifetimeReporter {
    constructor(
        @inject(IExampleTransientService)
        private readonly transientService: IExampleTransientService,

        @inject(IExampleScopedService)
        private readonly scopedService: IExampleScopedService,

        @inject(IExampleSingletonService)
        private readonly singletonService: IExampleSingletonService,
    ) {}

    reportServiceLifetimeDetails(lifetimeDetails: string): void {
        console.log(lifetimeDetails);

        logService(
            IExampleTransientService,
            this.transientService,
            'Always different',
        );
        logService(
            IExampleScopedService,
            this.scopedService,
            'Changes only with lifetime',
        );
        logService(
            IExampleSingletonService,
            this.singletonService,
            'Always the same',
        );
    }
}
```

### Register services for DI

```ts
import {
    IServiceProvider,
    addScopedCtor,
    addSingletonCtor,
    addTransientCtor,
    createDefaultBuilder,
    createScope,
    getRequiredService,
    runApp,
} from 'yohira';

function exemplifyServiceLifetime(
    hostProvider: IServiceProvider,
    lifetime: string,
): void {
    const serviceScope = createScope(hostProvider);
    const provider = serviceScope.serviceProvider;
    const reporter1 = getRequiredService<ServiceLifetimeReporter>(
        provider,
        Symbol.for('ServiceLifetimeReporter'),
    );
    reporter1.reportServiceLifetimeDetails(
        `${lifetime}: Call 1 to getRequiredService<ServiceLifetimeReporter>` +
            "(provider, Symbol.for('ServiceLifetimeReporter'))",
    );

    console.log('...');

    const reporter2 = getRequiredService<ServiceLifetimeReporter>(
        provider,
        Symbol.for('ServiceLifetimeReporter'),
    );
    reporter2.reportServiceLifetimeDetails(
        `${lifetime}: Call 2 to getRequiredService<ServiceLifetimeReporter>` +
            "(provider, Symbol.for('ServiceLifetimeReporter'))",
    );

    console.log('\n');

    serviceScope.dispose();
}

const host = createDefaultBuilder()
    .configureServices((context, services) => {
        addTransientCtor(
            services,
            IExampleTransientService,
            ExampleTransientService,
        );
        addScopedCtor(services, IExampleScopedService, ExampleScopedService);
        addSingletonCtor(
            services,
            IExampleSingletonService,
            ExampleSingletonService,
        );
        addTransientCtor(
            services,
            Symbol.for('ServiceLifetimeReporter'),
            ServiceLifetimeReporter,
        );
    })
    .build();

exemplifyServiceLifetime(host.services, 'Lifetime 1');
exemplifyServiceLifetime(host.services, 'Lifetime 2');

await runApp(host);
```

### See also

-   [Use dependency injection - .NET | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-usage)

## References

-   [dotnet/aspnetcore: ASP.NET Core is a cross-platform .NET framework for building modern cloud-based web applications on Windows, Mac, or Linux.](https://github.com/dotnet/aspnetcore)
-   [Deep Dive: How is the ASP.NET Core Middleware Pipeline Built? - Steve Gordon - Code with Steve](https://www.stevejgordon.co.uk/how-is-the-asp-net-core-middleware-pipeline-built)
-   [ASP.NET Core Anatomy - How does UseStartup work? - Steve Gordon - Code with Steve](https://www.stevejgordon.co.uk/aspnet-core-anatomy-how-does-usestartup-work)
-   [Styles of Writing ASP.NET Core Middleware](https://stevetalkscode.co.uk/middleware-styles)
-   [Writing convention-based ASP.NET Core middleware - part 3](https://www.azureblue.io/writing-convention-based-asp-net-core-middleware-part-3/)
-   [Writing factory-based ASP.NET Core middleware - part 4](https://www.azureblue.io/writing-factory-based-asp-net-core-middleware-part-4/)
-   [koajs/koa: Expressive middleware for node.js using ES2017 async functions](https://github.com/koajs/koa)
-   [asp.net core - What is the difference between IWebHost WebHostBuilder BuildWebHost - Stack Overflow](https://stackoverflow.com/questions/52085806/what-is-the-difference-between-iwebhost-webhostbuilder-buildwebhost)
-   [.NET Generic Host - .NET | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host)
-   [aspnetcore/BuildFromSource.md at 6956f42a0a01ed4fb8fc2cb889c2535f8fe5f735 · dotnet/aspnetcore](https://github.com/dotnet/aspnetcore/blob/6956f42a0a01ed4fb8fc2cb889c2535f8fe5f735/docs/BuildFromSource.md)
-   [ASP.NET Core Dependency Injection: What is the IServiceCollection? - Steve Gordon - Code with Steve](https://www.stevejgordon.co.uk/aspnet-core-dependency-injection-what-is-the-iservicecollection)
-   [ASP.NET Core Dependency Injection: What is the IServiceProvider and how is it Built? - Steve Gordon - Code with Steve](https://www.stevejgordon.co.uk/aspnet-core-dependency-injection-what-is-the-iserviceprovider-and-how-is-it-built)
-   [Dependency injection - .NET | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection)
-   [Worker Services - .NET | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)
-   [Dependency injection guidelines - .NET | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines)
-   [Strongly Typed Configuration Settings in ASP.NET Core - Rick Strahl's Web Log](https://weblog.west-wind.com/posts/2016/may/23/strongly-typed-configuration-settings-in-aspnet-core)
-   [Easy Configuration Binding in ASP.NET Core - revisited - Rick Strahl's Web Log](https://weblog.west-wind.com/posts/2017/dec/12/easy-configuration-binding-in-aspnet-core-revisited)
-   [Routing in ASP.NET Core | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing)
-   [Why doesn&#39;t IConfigurationProvider have an async Load method? · Issue #36018 · dotnet/runtime](https://github.com/dotnet/runtime/issues/36018)
-   [[API Proposal]: AsyncConfigurationProvider · Issue #79193 · dotnet/runtime](https://github.com/dotnet/runtime/issues/79193)
-   [c# - What&#39;s the role of the ClaimsPrincipal, why does it have multiple Identities? - Stack Overflow](https://stackoverflow.com/questions/32584074/whats-the-role-of-the-claimsprincipal-why-does-it-have-multiple-identities)
-   [Session in ASP.NET Core | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/app-state)
-   [Key storage format in ASP.NET Core | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/key-storage-format)
-   [Key management extensibility in ASP.NET Core | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/extensibility/key-management)
-   [Use cookie authentication without ASP.NET Core Identity | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie?view=aspnetcore-7.0)
-   [Mapping, customizing, and transforming claims in ASP.NET Core | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/claims?view=aspnetcore-7.0)
