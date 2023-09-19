import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Table, TableColumnType } from 'antd';
import moment from 'moment';
import { OrderListItem, Ticker, WsOrderSide, WsPushArg } from 'okx-node';

import { InstPageSubTitle, InstPageTitle } from '../common';
import { formatPrice } from '../formatter';
import { useIntervalRequest, usePush, useSubscribe } from '../hooks';

import { OrderForm } from './order-form';

const columns: TableColumnType<OrderListItem>[] = [
  {
    title: 'Inst',
    dataIndex: 'instId',
  },
  {
    title: 'Order Type',
    dataIndex: 'ordType',
  },
  {
    title: 'Side',
    dataIndex: 'side',
  },
  {
    title: 'Trade Mode',
    dataIndex: 'tdMode',
  },
  {
    title: 'Size',
    dataIndex: 'sz',
  },
  {
    title: 'Fill Size',
    dataIndex: 'accFillSz',
  },
  {
    title: 'Price',
    dataIndex: 'px',
    render: formatPrice,
  },
  {
    title: 'Created Time',
    dataIndex: 'cTime',
    render: (v: string) => {
      return moment(parseInt(v)).format('ss:mm:HH DD/MM');
    },
  },
];

export const PendingOrder = () => {
  const navigate = useNavigate();
  const params = useParams<{ instId: InstId | undefined }>();
  const [instId, setInstId] = useState(params.instId || 'BTC-USDC');
  useSubscribe(['tickers'], instId, [instId]);
  const [ticker] = usePush<WsPushArg & { instId: InstId }, Ticker>(
    'tickers',
    arg => arg.instId === instId,
    [instId]
  );
  const [side, setSide] = useState<WsOrderSide>('buy');
  const [open, setOpen] = useState<boolean>(false);
  const [orders] = useIntervalRequest(
    () => {
      const { restClient } = window;
      return restClient.getOrderList({
        instId,
      });
    },
    1000,
    [instId]
  );

  return (
    <PageContainer
      token={{
        paddingInlinePageContainerContent: 20,
      }}
      title={<InstPageTitle instId={instId} onChange={setInstId} />}
      subTitle={!!ticker && <InstPageSubTitle ticker={ticker} />}
      extra={[
        <Button
          key="1"
          onClick={() => {
            navigate(`/market/inst/${instId}`);
          }}
        >
          Quotes
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
      <ProCard
        style={{
          minHeight: `calc(100% - 136px)`,
        }}
      >
        <Table
          rowKey={'ordId'}
          columns={columns}
          dataSource={orders || []}
          loading={!orders}
        />
      </ProCard>

      <OrderForm
        key={`order-form-${side}-${instId}`}
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
