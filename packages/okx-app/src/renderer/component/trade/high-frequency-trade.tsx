import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { PlusCircleOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { Ticker, WsPushArg } from 'okx-node';

import { InstPageSubTitle, InstPageTitle } from '../common';
import { usePush, useSubscribe } from '../hooks';
import { LastTrades } from '../market/last-trades';
import { OrderBookContainer } from '../market/order-book';

import { HighFrequency } from './high-frequency';
import { TraderDetail } from './trader-detail';
import { TraderForm } from './trader-form';
import { TraderEvent, traderManager } from './trader-manager';

import styles from './high-frequency-trade.module.scss';

// subscribing and unsubscribing will be done at page level. Consuming push data will be done at component level.
export const HighFrequencyTrade = () => {
  const params = useParams<{ instId: InstId }>();
  const [instId, setInstId] = useState<InstId>(params.instId || 'BTC-USDC');
  const [newTraderFormVisible, setNewTraderFormVisible] = useState(false);
  const [traders, setTraders] = useState<[string, HighFrequency][]>([]);
  const [tab, setTab] = useState('');

  useEffect(() => {
    const updateTraders = (e?: TraderEvent) => {
      const ts = traderManager.getTraders(instId);
      setTraders(ts);
      if (ts.length > 0) {
        setTimeout(() => {
          if (e) {
            if (e.type === 'traderadded') {
              setTab(e.detail.name);
            } else {
              setTab(ts[0][0]);
            }
          } else {
            setTab(ts[0][0]);
          }
        }, 100);
      }
    };
    updateTraders();
    traderManager.addEventListener('traderadded', updateTraders);
    traderManager.addEventListener('traderremoved', updateTraders);
  }, [instId]);

  useSubscribe(['books5', 'trades', 'tickers'], instId, [instId]);

  const [ticker] = usePush<WsPushArg & { instId: InstId }, Ticker>(
    'tickers',
    (arg: { channel: 'tickers'; instId: InstId }) => {
      return arg.instId === instId;
    },
    [instId]
  );

  return (
    <PageContainer
      token={{
        paddingInlinePageContainerContent: 20,
      }}
      title={
        <InstPageTitle
          key={`title-${instId}`}
          instId={instId}
          onChange={(value: InstId) => {
            setInstId(value);
          }}
        />
      }
      subTitle={
        !!ticker && (
          <InstPageSubTitle key={`sub-title-${instId}`} ticker={ticker} />
        )
      }
      extra={
        <Space>
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => {
              setNewTraderFormVisible(true);
            }}
          >
            New Trader
          </Button>
        </Space>
      }
    >
      <div className={styles.main}>
        <ProCard direction="column" className={styles.mainBody}>
          {traders.length > 0 ? (
            <ProCard
              tabs={{
                tabPosition: 'top',
                activeKey: tab,
                items: traders.map(([name, trader]) => {
                  return {
                    label: name,
                    key: name,
                    children: (
                      <TraderDetail key={name} name={name} trader={trader} />
                    ),
                  };
                }),
                onTabClick(key: string) {
                  setTab(key);
                },
              }}
            />
          ) : (
            <ProCard layout="center">
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  setNewTraderFormVisible(true);
                }}
                icon={<PlusCircleOutlined />}
              >
                Create New Trader
              </Button>
            </ProCard>
          )}
        </ProCard>
        <div className={styles.mainAside}>
          <ProCard title="Books" style={{ marginBottom: '12px' }}>
            <OrderBookContainer key={`order-book-${instId}`} instId={instId} />
          </ProCard>
          <ProCard title="Last Trades">
            <LastTrades key={`last-trades-${instId}`} instId={instId} />
          </ProCard>
        </div>
      </div>
      <TraderForm
        key={`new-trader-form-${instId}`}
        instId={instId}
        open={newTraderFormVisible}
        onOpenChange={setNewTraderFormVisible}
      />
    </PageContainer>
  );
};
