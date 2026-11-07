import * as fs from 'fs/promises';
import { ASYNCAPI_SCHEMA_ELEMENT_ID } from '../../src/services/asyncapi.generator';

/**
 * Checks the served HTML page: standalone renderer present and embedded document equal to the reference.
 */
export async function expectValidDocHtml(html: string): Promise<void> {
  expect(html).toMatch(/^<!DOCTYPE html>/);
  expect(html).toContain('<div id="asyncapi"></div>');
  expect(html).toContain('AsyncApiStandalone.render(');

  const match = html.match(
    new RegExp(`<script type="application/json" id="${ASYNCAPI_SCHEMA_ELEMENT_ID}">([\\s\\S]*?)</script>`),
  );
  expect(match).not.toBeNull();

  const reference = JSON.parse(await fs.readFile('./misc/references/ref.json', { encoding: 'utf8' }));
  expect(JSON.parse(match![1])).toEqual(reference);
}
