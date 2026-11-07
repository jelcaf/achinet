/**
 * Ensures the path starts with a leading slash.
 */
export const validatePath = (inputPath: string): string => (inputPath.charAt(0) !== '/' ? `/${inputPath}` : inputPath);

/**
 * Removes a single trailing slash, if present.
 */
export const stripLastSlash = (path: string): string =>
  path && path[path.length - 1] === '/' ? path.slice(0, path.length - 1) : path;
