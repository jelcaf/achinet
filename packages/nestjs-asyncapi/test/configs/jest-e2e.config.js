// Forzamos ts-node desde aquí antes de importar la config real
require('ts-node').register({
  transpileOnly: true,
});

// Si usas `export default` en tu config.ts:
module.exports = require('./jest-e2e.config.ts').default;