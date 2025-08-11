export function pick<T>(obj: any, keys: (keyof T)[]): T {
  const result = {} as T;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}
