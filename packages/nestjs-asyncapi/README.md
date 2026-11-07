# @achinet/nestjs-async

Generate [AsyncAPI](https://www.asyncapi.com/) documentation for your [NestJS](https://nestjs.com/) event-driven APIs (WebSocket gateways, microservices, message brokers) from decorators, the same way `@nestjs/swagger` does for REST.

- 📝 Describe operations with `@AsyncApiPub` / `@AsyncApiSub` next to your handlers.
- 🧩 Reuse your DTOs: payload schemas are generated from `@ApiProperty` (and the `@nestjs/swagger` CLI plugin, if enabled).
- 🌐 Serve an interactive HTML page, plus the raw document as JSON and YAML.
- 🪶 Lightweight: the HTML page is rendered in memory with [`@asyncapi/react-component`](https://github.com/asyncapi/asyncapi-react), with no code generation, headless browser or temp files.

## Installation

```bash
npm install @achinet/nestjs-async
```

The NestJS framework packages are **peer dependencies**, so your application uses its own copies:

| Package | Version | Notes |
|---|---|---|
| `@nestjs/common`, `@nestjs/core` | `^11.1.14` | |
| `@nestjs/swagger` | `^11.2.6` | Used to build payload schemas |
| `reflect-metadata` | `^0.1.12 \|\| ^0.2.0` | |
| `@nestjs/websockets` | `^11.1.14` | *Optional*, only needed to document WebSocket gateways |

```bash
npm install @nestjs/common @nestjs/core @nestjs/swagger reflect-metadata
```

## Quick start

### 1. Describe your payloads

Payload classes are regular DTOs decorated for `@nestjs/swagger`:

```ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty({ example: 'Tom' })
  name: string;

  @ApiProperty({ minimum: 0 })
  age: number;
}
```

### 2. Document your operations

`@AsyncApiPub` and `@AsyncApiSub` can be placed on methods of **controllers** (e.g. `@EventPattern` handlers), **WebSocket gateways** and any provider decorated with `@AsyncApi()`.

```ts
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { AsyncApiPub, AsyncApiSub } from '@achinet/nestjs-async';

@Controller()
export class CatsController {
  @AsyncApiPub({
    channel: 'cats/create',
    summary: 'Create a cat',
    message: { payload: CreateCatDto },
  })
  @EventPattern('cats/create')
  async create(dto: CreateCatDto) {
    // ...
  }

  @AsyncApiSub({
    channel: 'cats/created',
    tags: [{ name: 'cats' }],
    message: {
      name: 'CatCreated',
      payload: CatDto,
      headers: { 'x-correlation-id': { description: 'Correlation id', format: 'uuid' } },
    },
  })
  async emitCreated(cat: CatDto) {
    // ...
  }
}
```

> **Pub vs Sub** follows AsyncAPI 2.x semantics from the client's point of view:
> `@AsyncApiPub` describes messages **clients send to your application**,
> `@AsyncApiSub` describes messages **your application sends to clients**.

A message can also be a list of alternatives (rendered as `oneOf`):

```ts
@AsyncApiSub({
  channel: 'cats/updated',
  message: [
    { name: 'Partial update', payload: CatPatchDto },
    { name: 'Full update', payload: CatDto },
  ],
})
```

To document a plain provider (not a controller or gateway), mark the class with `@AsyncApi()`:

```ts
import { Injectable } from '@nestjs/common';
import { AsyncApi, AsyncApiSub } from '@achinet/nestjs-async';

@AsyncApi()
@Injectable()
export class NotificationsPublisher {
  @AsyncApiSub({ channel: 'notifications', message: { payload: NotificationDto } })
  publish(notification: NotificationDto) {
    // ...
  }
}
```

### 3. Build the document and serve it

```ts
import { NestFactory } from '@nestjs/core';
import { AsyncApiDocumentBuilder, AsyncApiModule } from '@achinet/nestjs-async';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new AsyncApiDocumentBuilder()
    .setTitle('Cats events')
    .setDescription('Events published and consumed by the cats service')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addServer('production', {
      url: 'amqp://broker.example.com:5672',
      protocol: 'amqp',
    })
    .build();

  const document = AsyncApiModule.createDocument(app, config);
  await AsyncApiModule.setup('async-api', app, document);

  await app.listen(3000);
}
bootstrap();
```

This exposes:

| Path | Content |
|---|---|
| `/async-api` | Interactive HTML documentation |
| `/async-api-json` | AsyncAPI document (JSON) |
| `/async-api-yaml` | AsyncAPI document (YAML) |

## API

### `AsyncApiModule.createDocument(app, config, options?)`

Scans the application and returns the AsyncAPI document. `options` accepts the same fields as `SwaggerDocumentOptions`, the most useful being:

| Option | Description |
|---|---|
| `include` | Only scan these modules |
| `extraModels` | Extra classes to add to `components.schemas` (e.g. classes only referenced through `getSchemaPath()`) |
| `deepScanRoutes` | Also scan modules imported by the included ones |
| `operationIdFactory` | Customize `operationId` generation |

It works with any application context, including microservice-only apps created with `NestFactory.createMicroservice()`.

### `AsyncApiModule.setup(path, app, document, templateOptions?)`

Registers the HTML, JSON and YAML routes on the HTTP adapter (Express or Fastify).

| Template option | Description |
|---|---|
| `sidebarOrganization` | `'byTags'` groups operations by root-level tags, `'byTagsNoRoot'` by each operation's tags |
| `baseHref` | Adds a `<base href>` to the page |
| `favicon` | Favicon URL or data URI |
| `config` | Overrides for the [`@asyncapi/react-component` configuration](https://github.com/asyncapi/asyncapi-react/blob/master/docs/configuration/config-modification.md), e.g. `{ show: { servers: false } }` |

### `AsyncApiModule.composeHtml(document, templateOptions?)`

Returns the HTML page as a string, without registering any route. Useful to export static docs:

```ts
import { writeFile } from 'fs/promises';

await writeFile('asyncapi.html', await AsyncApiModule.composeHtml(document));
await writeFile('asyncapi.json', JSON.stringify(document, null, 2));
```

### `AsyncApiDocumentBuilder`

Fluent builder for the document root: `setTitle`, `setDescription`, `setVersion`, `setTermsOfService`, `setContact`, `setLicense`, `setExternalDoc`, `setDefaultContentType`, `addServer` / `addServers`, `addTag`, and security schemes (`addSecurity`, `addBearerAuth`, `addOAuth2`, `addApiKey`, `addBasicAuth`, `addCookieAuth`).

### Decorators

| Decorator | Target | Description |
|---|---|---|
| `@AsyncApiPub(...operations)` | Method | Messages clients send to the application |
| `@AsyncApiSub(...operations)` | Method | Messages the application sends to clients |
| `@AsyncApiOperation(...operations)` | Method | Same as above with an explicit `type: 'pub' \| 'sub'` |
| `@AsyncApi()` | Class | Includes a provider that is neither a controller nor a gateway in the scan |

Operations accept the AsyncAPI operation fields (`channel`, `operationId`, `summary`, `description`, `tags`, `externalDocs`, `bindings`, `traits`) plus `message`.

## Example

A complete example (WebSocket gateway + TCP microservice) lives in the [`sample`](https://github.com/jelcaf/achinet/tree/main/packages/nestjs-asyncapi/sample) folder of the repository:

```bash
git clone https://github.com/jelcaf/achinet.git
cd achinet && yarn install
cd packages/nestjs-asyncapi && yarn start:sample
# open http://localhost:4001/async-api
```

## Credits

Based on [`nestjs-asyncapi`](https://github.com/flamewow/nestjs-asyncapi), updated for NestJS 11 and the current AsyncAPI tooling.
