/**
 * Options for the HTML page rendered with `@asyncapi/react-component`.
 */
export interface AsyncApiTemplateOptions {
  /**
   * How operations are grouped in the sidebar.
   * - `byTags`: by the tags defined at the root of the document.
   * - `byTagsNoRoot`: by the tags of each operation.
   * When omitted, operations are listed without grouping.
   */
  sidebarOrganization?: 'byTags' | 'byTagsNoRoot';

  /**
   * Adds a `<base href>` to the page.
   * @example /docs/
   */
  baseHref?: string;

  /**
   * Favicon URL or data URI.
   * @example /static/favicon.ico
   */
  favicon?: string;

  /**
   * Overrides for the `@asyncapi/react-component` configuration, deep-merged over the defaults.
   * @see https://github.com/asyncapi/asyncapi-react/blob/master/docs/configuration/config-modification.md
   * @example { show: { servers: false } }
   */
  config?: Record<string, unknown>;
}
