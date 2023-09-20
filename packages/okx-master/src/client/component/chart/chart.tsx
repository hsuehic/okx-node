import { useEffect, useRef } from 'react';

import * as echarts from 'echarts';
import {
  CandleNoVolume,
  WsMarkPriceCandleArray,
  WsPublicIndexKlineChannel,
  WsPush,
} from 'okx-node';

import '../../../global.js';

import {
  CandlestickChartData,
  calculateCandlestickChartData,
  calculateMAItem,
  candleNoVolumeToCandlestick,
  getChartOption,
  getXAxisItem,
} from './option';

const loadInititialData = async (instId: string, bar: Bar) => {
  const { restClient } = window;
  const res = await restClient.getIndexCandles(instId, bar);
  return res;
};

const updateCandlestickChartData = (
  data: CandlestickChartData,
  push: CandleNoVolume
) => {
  const { xAxis, lines, candlestick: candlestickConfig } = data;
  const candlestickArr = candlestickConfig.data;
  const candlestick = candleNoVolumeToCandlestick(push);
  const xAxisItem = getXAxisItem(push, candlestickConfig.name);
  const ma5Item = calculateMAItem(candlestick, 0, candlestickArr, 5);
  const ma10Item = calculateMAItem(candlestick, 0, candlestickArr, 10);
  const ma20Item = calculateMAItem(candlestick, 0, candlestickArr, 20);
  if (candlestickArr[0][4] === '0') {
    candlestickArr[0] = candlestick;
    xAxis[0] = xAxisItem;
    lines[0].data[0] = ma5Item;
    lines[1].data[0] = ma10Item;
    lines[2].data[0] = ma20Item;
  } else {
    candlestickArr.unshift(candlestick);
    xAxis.unshift(xAxisItem);
    lines[0].data.unshift(ma5Item);
    lines[1].data.unshift(ma10Item);
    lines[2].data.unshift(ma20Item);
  }
  return data;
};

const subscribeIndex = (
  instId: string,
  channel: WsPublicIndexKlineChannel,
  handler: (data: WsPush) => void
) => {
  const { wsClient } = window;
  wsClient.subscribe({
    instId,
    channel,
  });
  const pushEventName = `push-${channel}` as const;
  wsClient.on(pushEventName, handler);
};

const unsubscribeIndex = (
  instId: string,
  channel: WsPublicIndexKlineChannel,
  handler: (
    data: WsPush<
      { channel: WsPublicIndexKlineChannel; instId: string },
      WsMarkPriceCandleArray
    >
  ) => void
) => {
  const { wsClient } = window;
  wsClient.unsubscribe({
    instId,
    channel,
  });
  const pushEventName = `push-${channel}` as const;
  wsClient.off(pushEventName, handler);
};

export interface ChartProps {
  className: string;
  instId: string;
  channel: WsPublicIndexKlineChannel;
}

export const Chart = ({ className, instId, channel }: ChartProps) => {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chart = echarts.init(elRef.current);
    const resizeHandler = () => {
      chart.resize();
    };
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);
  useEffect(() => {
    const chart = echarts.getInstanceByDom(
      elRef.current as HTMLElement
    ) as echarts.ECharts;
    const bar = channel.replace('index-candle', '') as Bar;
    let candlestickChartData: CandlestickChartData = {
      xAxis: [],
      candlestick: {
        name: bar,
        data: [],
      },
      lines: [],
    };

    const handler = (push: WsPush) => {
      const { arg, data } = push as WsPush<
        { channel: WsPublicIndexKlineChannel; instId: string },
        WsMarkPriceCandleArray
      >;
      if (arg.channel === channel && arg.instId === instId) {
        candlestickChartData = updateCandlestickChartData(
          candlestickChartData,
          data[0]
        );
        chart.setOption(getChartOption(candlestickChartData));
      }
    };
    void loadInititialData(instId, bar).then(
      (res: WsMarkPriceCandleArray[]) => {
        chart.hideLoading();
        candlestickChartData = calculateCandlestickChartData(res, bar);
        chart.setOption(getChartOption(candlestickChartData));
        subscribeIndex(instId, channel, handler);
      }
    );
    return () => {
      unsubscribeIndex(instId, channel, handler);
    };
  }, [channel, instId]);
  return <div className={className} ref={elRef}></div>;
};
