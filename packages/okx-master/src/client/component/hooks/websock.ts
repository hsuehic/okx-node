import { useEffect, useState } from 'react';

import { WsChannel, WsPush, WsPushArg } from 'okx-node';

export const useSubscribe = (
  channels: WsChannel[],
  instId: InstId,
  deps: unknown[] = []
) => {
  const { wsClient } = window;
  useEffect(() => {
    channels.forEach((channel: WsChannel) => {
      const arg = {
        channel,
        instId,
      };
      wsClient.subscribe(arg);
    });
    return () => {
      channels.forEach((channel: WsChannel) => {
        const arg = {
          channel,
          instId,
        };
        wsClient.unsubscribe(arg);
      });
    };
  }, [...deps]);
};

export const usePush = <TArg extends WsPushArg, TData extends object>(
  channel: WsChannel,
  test: (arg: TArg) => boolean,
  deps: unknown[] = [],
  handler?: (push: WsPush<TArg, TData>) => void
): [TData | undefined] => {
  const [v, setV] = useState<TData | undefined>(undefined);
  const pushHandler = (push: WsPush<TArg, TData>) => {
    if (test(push.arg)) {
      if (handler) {
        handler(push);
      }
      setV(push.data[0]);
    }
  };
  const { on, off } = window.wsClient;
  const pushEvent = `push-${channel}` as const;
  useEffect(() => {
    on(pushEvent, pushHandler);
    return () => {
      off(pushEvent, pushHandler);
    };
  }, [...deps]);
  return [v];
};
