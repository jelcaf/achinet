---
'@achinet/nestjs-async': minor
---

Use only the public API of `@nestjs/swagger`, fixing `ERR_PACKAGE_PATH_NOT_EXPORTED` with `@nestjs/swagger` >= 11.4.

**Breaking:** NestJS framework packages are now `peerDependencies` and must be installed by your application:

- `@nestjs/common` and `@nestjs/core` (`^11.1.14`)
- `@nestjs/swagger` (`^11.2.6`)
- `reflect-metadata` (`^0.1.12 || ^0.2.0`)
- `@nestjs/websockets` (`^11.1.14`, optional: only needed to document gateways)
