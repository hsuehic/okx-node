import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Table, TableColumnType } from 'antd';
import moment from 'moment';
import { OrderFill, Ticker, WsOrderSide, WsPushArg } from 'okx-node';

import { InstPageSubTitle, InstPageTitle } from '../common';
import { useIntervalRequest, usePush, useSubscribe } from '../hooks';

import { OrderForm } from './order-form';

const columns: TableColumnType<OrderFill>[] = [
  {
    title: 'Inst',
    dataIndex: 'instId',
  },
  {
    title: 'Client Order Id',
    dataIndex: 'clOrdId',
  },
  {
    title: 'Side',
    dataIndex: 'side',
  },
  {
    title: 'Fill Size',
    dataIndex: 'fillSz',
  },
  {
    title: 'Fill Price',
    dataIndex: 'fillPx',
  },
  {
    title: 'Fee',
    dataIndex: 'fee',
  },
  {
    title: 'Fee Currency',
    dataIndex: 'feeCcy',
  },
  {
    title: 'Fill Time',
    dataIndex: 'fillTime',
    render: (v: string) => {
      return moment(parseInt(v)).format('ss:mm:HH DD/MM');
    },
  },
];

export const OrderHistory = () => {
  const params = useParams<{ instId: InstId | undefined }>();
  const [instId, setInstId] = useState(params.instId || 'BTC-USDC');
  const navigate = useNavigate();
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
      return restClient.getFillsHistory({
        instType: 'MARGIN',
        instId,
      });
    },
    2000,
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
          rowKey={'billId'}
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
