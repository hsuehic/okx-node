import { useEffect, useRef, useState } from 'react';

import {
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Button, Space, Table, TableColumnType } from 'antd';
import { WsOrder } from 'okx-node';

import {
  HighFrequency,
  OrderEventDetail,
  TraderStatusEvent,
} from './high-frequency';
import { traderManager } from './trader-manager';

import styles from './trader-detail.module.scss';

export interface TraderDetailProps {
  name: string;
  trader: HighFrequency;
}
const columns: TableColumnType<WsOrder>[] = [
  {
    title: 'Inst',
    dataIndex: 'instId',
  },
  {
    title: 'Order Side',
    dataIndex: 'side',
  },
  {
    title: 'Order Price',
    dataIndex: 'px',
  },
  {
    title: 'Order Size',
    dataIndex: 'sz',
  },
  {
    title: 'Filled Size',
    dataIndex: 'fillSz',
  },
  {
    title: 'Average Price',
    dataIndex: 'avgPx',
  },
];

const columns2: TableColumnType<WsOrder>[] = [
  {
    title: 'Inst',
    dataIndex: 'instId',
  },
  {
    title: 'Order Side',
    dataIndex: 'side',
  },
  {
    title: 'Order Price',
    dataIndex: 'px',
  },
  {
    title: 'Order Size',
    dataIndex: 'sz',
  },
  {
    title: 'Filled Size',
    dataIndex: 'fillSz',
  },
  {
    title: 'Average Price',
    dataIndex: 'avgPx',
  },
];

export const TraderDetail = ({ trader, name }: TraderDetailProps) => {
  const { config } = trader;

  const formRef = useRef<ProFormInstance>();
  const [pendingOrders, setPendingOrders] = useState<WsOrder[]>([]);
  const [filledOrders, setFilledOrders] = useState<WsOrder[]>([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const handler = (e: CustomEvent<OrderEventDetail>) => {
      setPendingOrders(e.detail.pendingOrders);
      setFilledOrders(e.detail.filledOrders);
    };
    const statusHandler = (e: TraderStatusEvent) => {
      setStarted(e.detail.started);
    };
    trader.addEventListener('orders', handler);
    trader.addEventListener('started', statusHandler);
    trader.addEventListener('stoped', statusHandler);
    setStarted(trader.started);
    setPendingOrders(trader.pendingOrders);
    setFilledOrders(trader.filledOrders);
    return () => {
      trader.removeEventListener('orders', handler);
      trader.removeEventListener('started', statusHandler);
      trader.removeEventListener('stoped', statusHandler);
    };
  }, [trader]);
  return (
    <div>
      <ProCard
        headerBordered
        title="Settings"
        extra={
          <Space>
            <Button
              type="default"
              onClick={() => {
                traderManager.removeTrader(name);
              }}
            >
              Remove
            </Button>
            <Button
              type="default"
              onClick={() => {
                if (started) {
                  trader.stop();
                } else {
                  trader.start();
                }
              }}
            >
              {started ? 'Stop' : 'Start'}
            </Button>
          </Space>
        }
      >
        <ProForm
          formRef={formRef}
          initialValues={config}
          disabled={true}
          layout="horizontal"
          grid={true}
          submitter={false}
          labelCol={{
            span: 11,
          }}
          wrapperCol={{
            span: 12,
          }}
        >
          <ProFormDigit
            colProps={{ span: 8 }}
            placeholder={''}
            name="basePx"
            label="Base Price"
            rules={[{ required: true, message: 'Required' }]}
          />
          <ProFormDigit
            colProps={{ span: 8 }}
            placeholder={''}
            name="gap"
            label="Gap"
            rules={[{ required: true, message: 'Required' }]}
          />
          <ProFormDigit
            colProps={{ span: 8 }}
            placeholder={''}
            name="baseSz"
            label="Base Size"
            rules={[{ required: true, message: 'Required' }]}
          />
          <ProFormDigit
            colProps={{ span: 8 }}
            placeholder={''}
            name="levelCount"
            label="Level Count"
            rules={[{ required: true, message: 'Required' }]}
          />
          <ProFormDigit
            colProps={{ span: 8 }}
            placeholder={''}
            name="coefficient"
            label="Coefficient"
            rules={[{ required: true, message: 'Required' }]}
          />
        </ProForm>
      </ProCard>
      <Table
        title={() => (
          <span className={styles.sectionHeader}>Filled Orders</span>
        )}
        columns={columns2}
        dataSource={filledOrders}
        rowKey={'clOrdId'}
        pagination={false}
      />
      <Table
        title={() => (
          <span className={styles.sectionHeader}>Pending Orders</span>
        )}
        columns={columns}
        pagination={false}
        dataSource={pendingOrders}
        rowKey={'clOrdId'}
      />
    </div>
  );
};
