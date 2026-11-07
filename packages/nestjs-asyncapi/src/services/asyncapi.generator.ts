import { readFile } from 'fs/promises';
import { merge } from 'lodash';
import { dirname, join } from 'path';
import { AsyncApiDocument, AsyncApiTemplateOptions } from '../interface';

interface StandaloneAssets {
  script: string;
  styles: string;
}

/** Element id of the embedded AsyncAPI document (JSON). */
export const ASYNCAPI_SCHEMA_ELEMENT_ID = 'asyncapi-schema';

const DEFAULT_COMPONENT_CONFIG = {
  show: { sidebar: true },
  sidebar: { showOperations: 'byDefault' },
};

const SIDEBAR_ORGANIZATION: Record<NonNullable<AsyncApiTemplateOptions['sidebarOrganization']>, string> = {
  byTags: 'bySpecTags',
  byTagsNoRoot: 'byOperationsTags',
};

/**
 * Minimal page reset; the component stylesheet doesn't set a base font
 * (`@asyncapi/html-template` used to ship a Tailwind preflight for this).
 */
const BASE_STYLES =
  'body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;' +
  '-webkit-font-smoothing:antialiased;line-height:1.5}';

let assetsPromise: Promise<StandaloneAssets> | undefined;

/**
 * Reads the prebuilt standalone bundle and stylesheet of `@asyncapi/react-component` once per process.
 */
function loadStandaloneAssets(): Promise<StandaloneAssets> {
  if (!assetsPromise) {
    const root = dirname(require.resolve('@asyncapi/react-component/package.json'));
    assetsPromise = Promise.all([
      readFile(join(root, 'browser/standalone/index.js'), 'utf8'),
      readFile(join(root, 'styles/default.min.css'), 'utf8'),
    ]).then(([script, styles]) => ({ script, styles }));
    // Allow a retry if reading failed (e.g. transient FS error)
    assetsPromise.catch(() => {
      assetsPromise = undefined;
    });
  }
  return assetsPromise;
}

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Serializes JSON so it can be safely placed inside a <script> element.
 */
const toScriptJson = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

/** Prevents inline code from closing its own <script>/<style> element. */
const escapeInline = (code: string, tag: 'script' | 'style'): string =>
  code.replace(new RegExp(`</${tag}`, 'gi'), `<\\/${tag}`);

/**
 * Renders a self-contained HTML page for an AsyncAPI document using the
 * standalone build of `@asyncapi/react-component` (no code generation, no temp files).
 */
export class AsyncapiGenerator {
  constructor(private readonly templateOptions: AsyncApiTemplateOptions = {}) {}

  public async generate(contract: AsyncApiDocument): Promise<string> {
    const { script, styles } = await loadStandaloneAssets();
    const { baseHref, favicon } = this.templateOptions;
    const title = `${contract.info?.title ?? 'AsyncAPI'} ${contract.info?.version ?? ''} documentation`.trim();

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${baseHref ? `<base href="${escapeHtml(baseHref)}">` : ''}
    <title>${escapeHtml(title)}</title>
    <link rel="icon" href="${escapeHtml(favicon ?? 'data:,')}">
    <style>${BASE_STYLES}</style>
    <style>${escapeInline(styles, 'style')}</style>
  </head>
  <body>
    <div id="asyncapi"></div>
    <script type="application/json" id="${ASYNCAPI_SCHEMA_ELEMENT_ID}">${toScriptJson(contract)}</script>
    <script>${escapeInline(script, 'script')}</script>
    <script>
      AsyncApiStandalone.render(
        {
          schema: JSON.parse(document.getElementById('${ASYNCAPI_SCHEMA_ELEMENT_ID}').textContent),
          config: ${toScriptJson(this.buildComponentConfig())},
        },
        document.getElementById('asyncapi'),
      );
    </script>
  </body>
</html>
`;
  }

  /**
   * Mirrors the configuration logic of `@asyncapi/html-template`.
   */
  private buildComponentConfig(): Record<string, unknown> {
    const { sidebarOrganization, config } = this.templateOptions;
    const merged = merge({}, DEFAULT_COMPONENT_CONFIG, config);
    if (sidebarOrganization) {
      merged.sidebar = { ...merged.sidebar, showOperations: SIDEBAR_ORGANIZATION[sidebarOrganization] };
    }
    return merged;
  }
}
