import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button } from 'antd';
import { Ticker, WsChannel, WsOrderSide, WsPushArg } from 'okx-node';

import { CandleStick } from '../chart/candle-stick';
import { InstPageSubTitle, InstPageTitle } from '../common';
import { usePush, useSubscribe } from '../hooks';
import { OrderForm } from '../order/order-form';

import { LastTrades } from './last-trades';
import { OrderBookContainer } from './order-book';

import styles from './instrument.module.scss';

// subscribing and unsubscribing will be done at page level. Consuming push data will be done at component level.
export const Instrument = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<WsOrderSide>('buy');
  const params = useParams<{ instId: InstId }>();
  const [instId, setInstId] = useState<InstId>(params.instId || 'BTC-USDC');

  useSubscribe(['books5', 'trades', 'tickers'], instId, [instId]);
  const [ticker] = usePush<WsPushArg & { instId: InstId }, Ticker>(
    'tickers',
    (arg: { channel: WsChannel; instId: InstId }) => {
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
      extra={[
        <Button
          key="1"
          onClick={() => {
            navigate(`/order/pending/${instId}`);
          }}
        >
          Books
        </Button>,
        <Button
          key="3"
          onClick={() => {
            setSide('sell');
            setOpen(true);
          }}
        >
          Sell
        </Button>,
        <Button
          onClick={() => {
            setSide('buy');
            setOpen(true);
          }}
          type="primary"
          key="2"
        >
          Buy
        </Button>,
      ]}
    >
      <div className={styles.main}>
        <CandleStick
          className={styles.mainBody}
          instId={instId}
          key={`candle-stick-${instId}`}
        />
        <div className={styles.mainAside}>
          <ProCard title="Books" style={{ marginBottom: '12px' }}>
            <OrderBookContainer key={`order-book-${instId}`} instId={instId} />
          </ProCard>
          <ProCard title="Last Trades">
            <LastTrades key={`last-trades-${instId}`} instId={instId} />
          </ProCard>
        </div>
      </div>

      <OrderForm
        key={`order-form-${instId}-${side}`}
        open={open}
        onOpenChange={value => {
          setOpen(value);
        }}
        instId={instId}
        side={side}
      />
    </PageContainer>
  );
};
