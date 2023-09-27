import { useRef, useState } from 'react';

import {
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Button, Space, Table, TableColumnType, message } from 'antd';
import { WsOrder } from 'okx-node';

import { OkxTraderItem } from '../../../type';
import { updateTrader } from '../api/trader';
import { renderTime } from '../renderer';

import styles from './trader-detail.module.scss';

export interface TraderDetailProps {
  name: string;
  trader: OkxTraderItem;
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
    dataIndex: 'accFillSz',
  },
  {
    title: 'Average Price',
    dataIndex: 'avgPx',
  },
  {
    title: 'Created Time',
    dataIndex: 'uTime',
    render: (v: string) => {
      return renderTime(v);
    },
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
    dataIndex: 'accFillSz',
  },
  {
    title: 'Average Price',
    dataIndex: 'avgPx',
  },
  {
    title: 'Filled Time',
    dataIndex: 'fillTime',
    render: (v: string) => {
      return renderTime(v);
    },
  },
];

export const TraderDetail = ({ trader }: { trader: OkxTraderItem }) => {
  const { id, config, status, pendingOrders, filledOrders } = trader;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const started = status === 'running';
  return (
    <div>
      <ProCard
        headerBordered
        title="Settings"
        extra={
          <Space>
            <Button
              loading={removing}
              type="default"
              onClick={() => {
                setRemoving(true);
                updateTrader(id, 'removed')
                  .then(() => {
                    void message.success('Successfully removed the trader');
                  })
                  .catch(ex => {
                    void message.error(ex as string);
                  });
              }}
            >
              Remove
            </Button>
            <Button
              type="default"
              loading={loading}
              onClick={() => {
                setLoading(true);
                updateTrader(id, started ? 'stopped' : 'running')
                  .then(() => {
                    setLoading(false);
                  })
                  .catch(ex => console.error(ex));
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
