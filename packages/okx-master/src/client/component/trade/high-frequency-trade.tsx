import { useState } from 'react';
import { useParams } from 'react-router';

import { PlusCircleOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { Ticker, WsChannel, WsPushArgInstId } from 'okx-node';

import { OkxTraderItem } from '../../../server/type';
import { getTraders } from '../api/trader';
import { InstPageSubTitle, InstPageTitle } from '../common';
import { useIntervalRequest, usePush, useSubscribe } from '../hooks';
import { LastTrades } from '../market/last-trades';
import { OrderBookContainer } from '../market/order-book';

import { TraderDetail } from './trader-detail';
import { TraderForm } from './trader-form';

import styles from './high-frequency-trade.module.scss';

// subscribing and unsubscribing will be done at page level. Consuming push data will be done at component level.
export const PriceTrade = () => {
  const params = useParams<{ instId: InstId }>();
  const [instId, setInstId] = useState<InstId>(params.instId || 'BTC-USDC');
  const [newTraderFormVisible, setNewTraderFormVisible] = useState(false);
  const [tab, setTab] = useState('');
  const [traders] = useIntervalRequest<OkxTraderItem[]>(
    async () => {
      const traderItems = await getTraders({ instId });
      return traderItems;
    },
    1000,
    [instId]
  );
  if (traders && traders.length > 0) {
    const activeTrader = traders.find(v => v.name == tab);
    if (!activeTrader) {
      setTab(traders[0].name);
    }
  }

  useSubscribe(['books5', 'trades', 'tickers'], instId, [instId]);

  const [ticker] = usePush<WsPushArgInstId, Ticker>(
    'tickers',
    (arg: { channel: WsChannel; instId: string }) => {
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
          {traders && traders.length > 0 ? (
            <ProCard
              tabs={{
                tabPosition: 'top',
                activeKey: tab || traders[0].name,
                items: traders.map((trader: OkxTraderItem) => {
                  const { name } = trader;
                  return {
                    label: name,
                    key: name,
                    children: <TraderDetail key={name} trader={trader} />,
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
