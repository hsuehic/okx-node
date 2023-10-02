import { useCallback, useState } from 'react';
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

import { PriceTraderForm } from './price-trader-form';
import { TieredTraderForm } from './tiered-trader-form';
import { TraderDetail } from './trader-detail';

import styles from './trader-manager.module.scss';

// subscribing and unsubscribing will be done at page level. Consuming push data will be done at component level.
export const TraderManager = () => {
  const params = useParams<{ instId: InstId }>();
  const [instId, setInstId] = useState<InstId>(params.instId || 'BTC-USDC');
  const [priceTraderFormVisible, setPriceTraderFormVisible] = useState(false);
  const [tieredTraderFormVisible, setTieredTraderFormVisible] = useState(false);
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

  const validateTraderName = useCallback(
    (name: string) => {
      if (traders && traders.findIndex(v => v.name === name) > -1) {
        return 'Trader with the same name already exists';
      }
      return undefined;
    },
    [traders]
  );

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
              setPriceTraderFormVisible(true);
            }}
          >
            Price Trader
          </Button>
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => {
              setTieredTraderFormVisible(true);
            }}
          >
            Tiered Trader
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
                  setTieredTraderFormVisible(true);
                }}
                icon={<PlusCircleOutlined />}
              >
                Create Tiered Trader
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
      <PriceTraderForm
        key={`price-trader-form-${instId}`}
        instId={instId}
        open={priceTraderFormVisible}
        onOpenChange={setPriceTraderFormVisible}
        price={ticker ? parseFloat(ticker.last) : undefined}
        validateTraderName={validateTraderName}
      />
      <TieredTraderForm
        key={`tiered-trader-form-${instId}`}
        instId={instId}
        open={tieredTraderFormVisible}
        onOpenChange={setTieredTraderFormVisible}
        price={ticker ? parseFloat(ticker.last) : undefined}
        validateTraderName={validateTraderName}
      />
    </PageContainer>
  );
};
