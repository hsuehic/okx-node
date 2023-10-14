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

import { SwapTraderDetail } from './swap-trader-detail';
import { SwapTraderForm } from './swap-trader-form';

import styles from './trader-manager.module.scss';

// subscribing and unsubscribing will be done at page level. Consuming push data will be done at component level.
export const SwapTraderManager = () => {
  const params = useParams<{ instId: InstIdSwap }>();
  const [instId, setInstId] = useState<InstIdSwap>(
    params.instId || 'BTC-USDC-SWAP'
  );
  const [swapTraderFormVisible, setSwapTraderFormVisible] = useState(false);
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
          type="SWAP"
          instId={instId}
          onChange={(value: InstIdSwap) => {
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
              setSwapTraderFormVisible(true);
            }}
          >
            Swap Trader
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
                    children: <SwapTraderDetail key={name} trader={trader} />,
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
                  setSwapTraderFormVisible(true);
                }}
                icon={<PlusCircleOutlined />}
              >
                Create Swap Trader
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
      <SwapTraderForm
        key={`tiered-trader-form-${instId}`}
        instId={instId}
        open={swapTraderFormVisible}
        onOpenChange={setSwapTraderFormVisible}
        price={ticker ? parseFloat(ticker.last) : undefined}
        validateTraderName={validateTraderName}
      />
    </PageContainer>
  );
};
