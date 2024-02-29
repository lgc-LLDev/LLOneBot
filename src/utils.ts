export type OmitNullOrUndef<T extends Record<any, any>> = {
  [P in {
    [K in keyof T]: T[K] extends null | undefined ? never : K;
  }[keyof T]]: T[P];
};

export type MapToString<T extends Record<any, any>> = {
  [P in keyof T]: `${T[P]}`;
};

export function trimCharStart(str: string, char: string) {
  while (str.startsWith(char)) str = str.slice(char.length);
  return str;
}

export function trimCharEnd(str: string, char: string) {
  while (str.endsWith(char)) str = str.slice(0, -char.length);
  return str;
}

export function trimChar(str: string, char: string) {
  return trimCharEnd(trimCharStart(str, char), char);
}

export function escapeCQ(str: string, escapeComma = false) {
  str = str
    .replace(/&/g, '&amp;')
    .replace(/\[/g, '&#91;')
    .replace(/\]/g, '&#93;');
  if (escapeComma) str = str.replace(/,/g, '&#44;');
  return str;
}

export function unescapeCQ(str: string) {
  return str
    .replace(/&#44;/g, ',')
    .replace(/&#91;/g, '[')
    .replace(/&#93;/g, ']')
    .replace(/&amp;/g, '&');
}

export function formatError(e: unknown): string {
  return e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function logErr(err: any) {
  logger.error(formatError(err));
}

export function objectKeyTransform<T>(
  obj: T,
  transform: (key: string) => string
): T | Record<string, any> {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj))
    return obj.map((v) => objectKeyTransform(v, transform));
  const newObj = {} as Record<string, any>;
  for (const key of Object.keys(obj))
    newObj[transform(key)] = objectKeyTransform(obj[key as keyof T], transform);
  return newObj;
}
