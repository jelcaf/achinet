# @achinet/nestjs-async

## 0.3.0

### Minor Changes

- b322b1a: Render the HTML documentation with the standalone build of `@asyncapi/react-component` instead of `@asyncapi/generator` + `@asyncapi/html-template`.

  This removes `puppeteer`, `@npmcli/arborist`, `simple-git` and their dependency trees from the package, eliminating all critical vulnerabilities reported for its production dependencies. HTML is now built in memory (no temp files) and much faster at startup.

  **Breaking:** `AsyncApiTemplateOptions` changes:

  - Removed `pdf`, `outFilename` and `singleFile`. They never worked through `AsyncApiModule.setup` (no PDF was produced, `outFilename` crashed with `ENOENT`, and `singleFile: false` served a page with missing assets).
  - Kept `sidebarOrganization` and `baseHref`.
  - Added `favicon` and `config` (overrides for the `@asyncapi/react-component` configuration).
  - Removed the exported `GeneratorOptions` interface.

- 3f874db: Use only the public API of `@nestjs/swagger`, fixing `ERR_PACKAGE_PATH_NOT_EXPORTED` with `@nestjs/swagger` >= 11.4.

  **Breaking:** NestJS framework packages are now `peerDependencies` and must be installed by your application:

  - `@nestjs/common` and `@nestjs/core` (`^11.1.14`)
  - `@nestjs/swagger` (`^11.2.6`)
  - `reflect-metadata` (`^0.1.12 || ^0.2.0`)
  - `@nestjs/websockets` (`^11.1.14`, optional: only needed to document gateways)

## 0.2.0

### Minor Changes

- c7575ad: Upgrade dependencies

## 0.1.1

### Patch Changes

- b32903e: Upgrade dependencies
- 436f491: Upgrade dependencies

## 0.1.0

### Minor Changes

- ef21291: Upgrade `@asyncapi` dependencies and adjust code

## 0.0.1

### Patch Changes

- 7ca0b6b: First version of the package
