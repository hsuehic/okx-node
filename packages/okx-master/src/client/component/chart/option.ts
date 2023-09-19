import { EChartsCoreOption } from 'echarts';
import moment from 'moment';
import { CandleNoVolume } from 'okx-node';
import { Candlestick } from 'tsxecharts';

export type Candlestick = [number, number, number, number, '0' | '1'];
export interface CandlestickChartData {
  xAxis: string[];
  candlestick: {
    name: Bar;
    data: Candlestick[];
  };
  lines: {
    name: string;
    data: number[];
  }[];
}

export const reverseArray = <T>(arr: T[]): T[] => {
  const v: T[] = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    v.push(arr[i]);
  }
  return v;
};

export const getXAxisItem = (
  candleNoVolume: CandleNoVolume,
  bar: Bar
): string => {
  const time = moment(new Date(parseInt(candleNoVolume[0])));
  if (bar.indexOf('m') > -1 || bar.indexOf('H') > -1) {
    return time.format('HH:mm DD/MM');
  } else {
    return time.format('DD/MM/YY');
  }
};

export const getXAxis = (
  candleNoVolumes: CandleNoVolume[],
  bar: Bar
): string[] => {
  return candleNoVolumes.map(candleNoVolume => {
    return getXAxisItem(candleNoVolume, bar);
  });
};

export const candleNoVolumeToCandlestick = (
  candleNoVolumn: CandleNoVolume
): Candlestick => {
  return [
    parseFloat(candleNoVolumn[1]),
    parseFloat(candleNoVolumn[4]),
    parseFloat(candleNoVolumn[3]),
    parseFloat(candleNoVolumn[2]),
    candleNoVolumn[5],
  ] as Candlestick;
};

export const getCandlesticks = (
  candlesticks: CandleNoVolume[]
): Candlestick[] => {
  return candlesticks.map(candlestick => {
    return candleNoVolumeToCandlestick(candlestick);
  });
};

export const calculateMAItem = (
  _v: Candlestick,
  index: number,
  arr: Candlestick[],
  dayCount: number
) => {
  const len = arr.length;
  let total = 0;
  let j = 0;
  let i = index;
  for (j = 0; j < dayCount; j++) {
    if (i >= len) {
      break;
    }
    total += arr[i][3];
    i++;
  }
  return total / j;
};

export const calculateMA = (
  candlesticks: Candlestick[],
  dayCount: number
): number[] => {
  return candlesticks.map((v: Candlestick, index: number, arr: Candlestick[]) =>
    calculateMAItem(v, index, arr, dayCount)
  );
};

export const calculateCandlestickChartData = (
  candlesticks: CandleNoVolume[],
  bar: Bar
): CandlestickChartData => {
  const xAxis: string[] = getXAxis(candlesticks, bar);
  const data = getCandlesticks(candlesticks);
  const dataMa5 = calculateMA(data, 5);
  const dataMa10 = calculateMA(data, 10);
  const dataMa20 = calculateMA(data, 20);
  const lines = [
    {
      name: 'MA5',
      data: dataMa5,
    },
    {
      name: 'MA10',
      data: dataMa10,
    },
    {
      name: 'MA20',
      data: dataMa20,
    },
  ];
  return {
    xAxis,
    lines,
    candlestick: {
      name: bar,
      data,
    },
  };
};

export const getChartOption = (
  candlestickChartData: CandlestickChartData
): EChartsCoreOption => {
  const { candlestick, xAxis, lines } = candlestickChartData;
  const options: EChartsCoreOption = {
    animation: false,
    legend: {
      data: [candlestick.name, ...lines.map(v => v.name)],
      inactiveColor: '#777',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        animation: false,
        type: 'cross',
        lineStyle: {
          color: '#376df4',
          width: 2,
          opacity: 1,
        },
      },
    },
    xAxis: {
      type: 'category',
      data: reverseArray(xAxis),
      axisLine: { lineStyle: { color: '#303030' } },
      splitLine: { show: true, lineStyle: { color: '#303030' } },
      minorTick: {
        show: false,
      },
      minorSplitLine: {
        show: false,
      },
      axisTick: {
        inside: true,
        show: false,
        lineStyle: { color: '#303030' },
      },
      axisLabel: {
        color: '#666',
      },
    },
    yAxis: {
      scale: true,
      position: 'right',
      axisLine: { lineStyle: { color: '#303030' } },
      splitLine: { show: true, lineStyle: { color: '#303030' } },
      minorTick: {
        show: true,
      },
      minorSplitLine: {
        show: true,
        lineStyle: { color: '#222222' },
      },
      axisTick: {
        inside: false,
        show: true,
        lineStyle: { color: '#303030' },
      },

      axisLabel: {
        align: 'left',
        verticalAlign: 'top',
        show: true,
        color: '#666',
      },
    },
    grid: {
      show: false,
      borderColor: '#303030',
      left: '1px',
      top: '1px',
      right: '68px',
      bottom: '20px',
    },
    series: [
      {
        type: 'candlestick',
        name: candlestick.name,
        data: reverseArray(candlestick.data),
        itemStyle: {
          color0: '#ca3f64',
          color: '#25a750',
          borderColor0: '#ca3f64',
          borderColor: '#25a750',
        },
        markLine: {
          animation: false,
          lineStyle: {
            color: '#fff',
            type: 'dashed',
          },
          data: [
            [
              {
                label: {
                  position: 'end',
                  formatter: (params: {
                    data: { coord: [number, number] };
                  }) => {
                    return params.data.coord[1].toLocaleString();
                  },
                  show: true,
                  color: '#fafafa',
                  distance: 10,
                  padding: 3,
                  backgroundColor: '#333',
                  fontSize: 12,
                },
                symbol: 'none',
                coord: [0, candlestick.data[0][1]],
              },
              {
                name: 'Price',
                label: {
                  show: true,
                  color: '#666',
                },
                symbol: 'none',
                coord: [xAxis.length - 1, candlestick.data[0][1]],
              },
            ],
          ],
        },
      },
      ...lines.map(v => {
        return {
          name: v.name,
          data: reverseArray(v.data),
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        };
      }),
    ],
  };
  return options;
};
