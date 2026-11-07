---
'@achinet/nestjs-async': minor
---

Render the HTML documentation with the standalone build of `@asyncapi/react-component` instead of `@asyncapi/generator` + `@asyncapi/html-template`.

This removes `puppeteer`, `@npmcli/arborist`, `simple-git` and their dependency trees from the package, eliminating all critical vulnerabilities reported for its production dependencies. HTML is now built in memory (no temp files) and much faster at startup.

**Breaking:** `AsyncApiTemplateOptions` changes:

- Removed `pdf`, `outFilename` and `singleFile`. They never worked through `AsyncApiModule.setup` (no PDF was produced, `outFilename` crashed with `ENOENT`, and `singleFile: false` served a page with missing assets).
- Kept `sidebarOrganization` and `baseHref`.
- Added `favicon` and `config` (overrides for the `@asyncapi/react-component` configuration).
- Removed the exported `GeneratorOptions` interface.
