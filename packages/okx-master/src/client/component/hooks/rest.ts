import { useEffect, useState } from 'react';

export const useRequest = <T>(
  request: () => Promise<T>,
  deps: unknown[] = []
): [T | undefined] => {
  const [value, setValue] = useState<T | undefined>(undefined);
  useEffect(() => {
    void request().then((data: T) => {
      setValue(data);
    });
  }, [...deps]);
  return [value];
};

export const useIntervalRequest = <T>(
  request: () => Promise<T>,
  ms: number,
  deps: unknown[] = []
): [T | undefined] => {
  const [value, setValue] = useState<T | undefined>(undefined);
  useEffect(() => {
    const timer = setInterval(() => {
      void request().then((data: T) => {
        setValue(data);
      });
    }, ms);

    return () => {
      clearInterval(timer);
    };
  }, [...deps]);
  return [value];
};
