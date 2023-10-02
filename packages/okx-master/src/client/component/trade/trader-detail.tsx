import { useRef, useState } from 'react';

import {
  ProCard,
  ProForm,
  ProFormInstance,
  StatisticCard,
} from '@ant-design/pro-components';
import { Button, Space, Table, TableColumnType, message } from 'antd';
import { WsOrder } from 'okx-node';

import { OkxTraderItem } from '../../../server/type';
import { updateTrader } from '../api/trader';
import { renderTime } from '../renderer';

import { PriceTraderFormItems } from './price-trader-form';
import { TieredTraderFormItems } from './tiered-trader-form';

import styles from './trader-detail.module.scss';

export interface TraderDetailProps {
  name: string;
  trader: OkxTraderItem;
}

const { Divider, Statistic } = StatisticCard;

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

const renderTraderConfig = (config: OkxTraderConfigType) => {
  const { type } = config;
  let node;
  switch (type) {
    case 'price':
      node = <PriceTraderFormItems />;
      break;
    case 'tiered':
      node = <TieredTraderFormItems />;
      break;
    default:
      break;
  }
  return node;
};

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
          {renderTraderConfig(config)}
        </ProForm>
      </ProCard>
      <StatisticCard.Group headerBordered title="Statistics" direction="row">
        <StatisticCard
          statistic={{
            title: 'Traded',
            value: trader.tradeSize,
            precision: 2,
            description: (
              <Statistic value={`$${trader.tradePrice.toFixed(2)}`} />
            ),
          }}
        />

        <Divider type="vertical" />

        <StatisticCard
          statistic={{
            title: 'Bought',
            value: trader.boughtSize,
            precision: 2,
            description: (
              <Statistic value={`$${trader.boughtPrice.toFixed(2)}`} />
            ),
          }}
        />
        <StatisticCard
          statistic={{
            title: 'Sold',
            value: trader.soldSize,
            precision: 2,
            description: (
              <Statistic value={`$${trader.soldPrice.toFixed(2)}`} />
            ),
          }}
        />
      </StatisticCard.Group>
      <Table
        title={() => (
          <span className={styles.sectionHeader}>Pending Orders</span>
        )}
        columns={columns}
        pagination={false}
        dataSource={pendingOrders}
        rowKey={'clOrdId'}
      />
      <Table
        title={() => (
          <span className={styles.sectionHeader}>Filled Orders</span>
        )}
        columns={columns2}
        dataSource={filledOrders}
        rowKey={'clOrdId'}
        pagination={false}
      />
    </div>
  );
};
