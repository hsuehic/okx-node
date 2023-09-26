export type HttpRequestMethod = 'POST' | 'GET' | 'DELETE' | 'PUT';

export interface ResponseBody<T> {
  msg: string;
  code: string;
  data: T[];
}

export const objectToQueryString = (initialObj: Record<string, unknown>) => {
  const reducer =
    (obj: Record<string, unknown>, parentPrefix: string | null = null) =>
    (prev: string[], key: string) => {
      const val = obj[key] as
        | null
        // eslint-disable-next-line @typescript-eslint/ban-types
        | Function
        | number
        | boolean
        | string
        | object;
      key = encodeURIComponent(key);
      const prefix = parentPrefix ? `${parentPrefix}[${key}]` : key;

      if (val == null || typeof val === 'function') {
        // handle function|null
        prev.push(`${prefix}=`);
        return prev;
      } else if (
        typeof val === 'number' ||
        typeof val === 'boolean' ||
        typeof val === 'string'
      ) {
        // handle number|boolean|string
        prev.push(`${prefix}=${encodeURIComponent(val)}`);
        return prev;
      } else {
        // handle object|array
        prev.push(
          Object.keys(val)
            .reduce(reducer(val as Record<string, unknown>, prefix), [])
            .join('&')
        );
      }

      return prev;
    };

  return Object.keys(initialObj).reduce(reducer(initialObj), []).join('&');
};

export const request = async <T>(
  url: string,
  init?: RequestInit
): Promise<T[]> => {
  const res = await fetch(url, {
    ...init,
    mode: 'cors',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    redirect: 'follow',
  });
  const json = (await res.json()) as ResponseBody<T>;
  const value = json.data;
  return value;
};

export const get = async <T>(
  url: string,
  queries?: Record<string, unknown>
) => {
  const urlWithQuery = `${url}${
    queries ? `?${objectToQueryString(queries)}` : ''
  }`;
  const result = request<T>(urlWithQuery, {
    method: 'GET',
  });
  return result;
};

export const post = async <T>(url: string, body?: object): Promise<T[]> => {
  const value = await request<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
  return value;
};
