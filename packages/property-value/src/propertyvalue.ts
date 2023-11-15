export type ExcludeFalsy<T> = Exclude<T, undefined | null>;

/**
 * Get property paths,
 * e.g.
 * interface Person { age: number; name: { first: string; middle?: string; last: string; }  }
 * type PersonPropertyPath = PropertyPath<Persion>; // 'age' | 'name' | 'name.first' | 'name.middle' | 'name.last'
 */
export type PropertyPath<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, any> | undefined | null
    ? `${K}.${PropertyPath<ExcludeFalsy<T[K]>, keyof ExcludeFalsy<T[K]>>}`
    : K
  : never;

/**
 * Get property type
 * e.g.
 * interface Person { age: number; name: { first: string; middle?: string; last: string; }  }
 * type PersonPropertyPath = PropertyPath<Persion, 'name.first'>; // string
 */
export type PropertyType<
  T,
  P extends PropertyPath<T>
> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? R extends PropertyPath<ExcludeFalsy<T[K]>>
      ? PropertyType<ExcludeFalsy<T[K]>, R>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

export const getPropertyValue = <T, P extends PropertyPath<T>>(
  obj: T,
  path: P
): PropertyType<T, P> => {
  const index = path.indexOf('.');
  if (obj instanceof Object) {
    if (index >= 0) {
      const k = path.substring(0, index) as keyof T;
      const p = obj[k];
      const r = path.substring(index + 1) as PropertyPath<typeof p>;
      return getPropertyValue(p, r) as PropertyType<T, P>;
    } else {
      return obj[path as keyof T] as PropertyType<T, P>;
    }
  } else {
    return undefined as PropertyType<T, P>;
  }
};
