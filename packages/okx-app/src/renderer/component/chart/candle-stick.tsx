import { useState } from 'react';

import { Segmented } from 'antd';

import { Chart } from './chart';

import styles from './candle-stick.module.scss';

export interface CandleStickProps {
  className: string;
  instId: InstId;
}

export const CandleStick = ({ instId, className }: CandleStickProps) => {
  const [bar, setBar] = useState<Bar>('1m');
  return (
    <div className={`${className} ${styles.container}`}>
      <div className={styles.tools}>
        <Segmented
          value={bar}
          onChange={value => setBar(value as Bar)}
          size="small"
          options={[
            '1m',
            '5m',
            '15m',
            '30m',
            '1H',
            '6H',
            '12H',
            '1D',
            '1M',
            '3M',
          ]}
        />
      </div>
      <Chart
        instId={instId}
        channel={`index-candle${bar}`}
        className={styles.map}
        key={`candle-stick-${instId}`}
      />
    </div>
  );
};
