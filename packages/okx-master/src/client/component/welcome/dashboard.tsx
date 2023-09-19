import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PageContainer, StatisticCard } from '@ant-design/pro-components';
import { Table, TableColumnType } from 'antd';
import { Ticker } from 'okx-node';

import { CLS_COLOR_DOWN, CLS_COLOR_UP, INST_ID_SUPPORTED } from '../constant';
import { formatPrice, formatRatio, setThousandComma } from '../formatter';
import { createSorter, getCryptoCurrencyIcon } from '../util';

import styles from './dashboard.module.scss';

const { Statistic } = StatisticCard;

const columns: TableColumnType<Ticker>[] = [
  {
    title: 'InstId',
    dataIndex: 'instId',
    render: (v: string) => {
      return <Link to={`/market/inst/${v}`}>{v}</Link>;
    },
    sorter: createSorter<Ticker>('instId'),
  },
  {
    title: 'Price',
    dataIndex: 'last',
    render: (v: string, item: Ticker) => {
      const open = parseFloat(item.sodUtc0);
      const cur = parseFloat(v);

      return (
        <span className={cur > open ? CLS_COLOR_UP : CLS_COLOR_DOWN}>
          {setThousandComma(cur.toFixed(2))}
        </span>
      );
    },
    align: 'right',
    sorter: createSorter<Ticker>((v: Ticker) => parseFloat(v.last)),
  },

  {
    title: 'Diff',
    render: (v: string, item: Ticker) => {
      const open = parseFloat(item.sodUtc0);
      const cur = parseFloat(item.last);
      const diff = cur - open;
      const diffRatio = (diff / open) * 100;
      const diffRatioStr = diffRatio.toFixed(2);
      return (
        <span className={cur > open ? CLS_COLOR_UP : CLS_COLOR_DOWN}>
          {diffRatioStr}%
        </span>
      );
    },
    align: 'right',
    sorter: createSorter<Ticker>((v: Ticker) => {
      const last = parseFloat(v.last);
      const open = parseFloat(v.sodUtc0);
      return (last - open) / open;
    }),
  },
  {
    title: 'Open(Utc0)',
    dataIndex: 'sodUtc0',
    render: formatPrice,
    align: 'right',
    sorter: createSorter<Ticker>((v: Ticker) => parseFloat(v.sodUtc0)),
  },
  {
    title: 'Open(Utc8)',
    dataIndex: 'sodUtc8',
    render: formatPrice,
    align: 'right',
    sorter: createSorter<Ticker>((v: Ticker) => parseFloat(v.sodUtc8)),
  },
  {
    title: 'Open(24h)',
    dataIndex: 'open24h',
    render: formatPrice,
    align: 'right',
    sorter: createSorter<Ticker>((v: Ticker) => parseFloat(v.open24h)),
  },
  {
    title: 'Volume(24h)',
    dataIndex: 'volCcy24h',
    render: formatPrice,
    align: 'right',
    sorter: createSorter<Ticker>((v: Ticker) => parseFloat(v.volCcy24h)),
  },
  {
    title: 'High',
    dataIndex: 'high24h',
    render: formatPrice,
    align: 'right',
    sorter: createSorter<Ticker>((v: Ticker) => parseFloat(v.high24h)),
  },
  {
    title: 'Low',
    dataIndex: 'low24h',
    render: formatPrice,
    align: 'right',
    sorter: createSorter<Ticker>((v: Ticker) => parseFloat(v.low24h)),
  },
];

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const getTickers = useCallback(() => {
    const { restClient } = window;
    void restClient.getTickers('SPOT').then((data: Ticker[]) => {
      setLoading(false);
      const spots = data
        .filter((v: Ticker): boolean => {
          return INST_ID_SUPPORTED.includes(v.instId as InstId);
        })
        .sort(createSorter(v => parseFloat(v.volCcy24h)))
        .reverse();
      setTickers(spots);
    });
  }, []);
  useEffect(() => {
    getTickers();
    const interval = setInterval(() => {
      getTickers();
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <PageContainer
      token={{
        paddingInlinePageContainerContent: 20,
      }}
    >
      <div
        style={{
          marginBottom: '12px',
        }}
      >
        <StatisticCard.Group loading={loading} direction="row">
          {tickers.slice(0, 5).map((ticker: Ticker, index: number) => {
            const last = parseFloat(ticker.last);
            const open = parseFloat(ticker.sodUtc0);
            const ratio = (last - open) / open;
            const className = last > open ? CLS_COLOR_UP : CLS_COLOR_DOWN;
            return (
              <StatisticCard
                key={`${ticker.instId}-${index}`}
                title={ticker.instId}
                statistic={{
                  value: last,
                  precision: 2,
                  className,
                  description: (
                    <Statistic
                      className={className}
                      value={formatRatio(ratio.toString())}
                    />
                  ),
                  icon: (
                    <img
                      className={styles.icon}
                      src={getCryptoCurrencyIcon(
                        ticker.instId.split('-')[0] as CryptoCurrency
                      )}
                      alt={ticker.instId}
                    />
                  ),
                }}
              />
            );
          })}
        </StatisticCard.Group>
      </div>
      <div>
        <Table
          dataSource={tickers}
          rowKey={'instId'}
          loading={loading}
          columns={columns}
          pagination={false}
        ></Table>
      </div>
    </PageContainer>
  );
};
