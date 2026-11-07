---
'@achinet/nestjs-async': minor
---

Use only the public API of `@nestjs/swagger`, fixing `ERR_PACKAGE_PATH_NOT_EXPORTED` with `@nestjs/swagger` >= 11.4.

**Breaking:** `@nestjs/swagger` is now a `peerDependency` (`^11.2.6`); install it in your application.
