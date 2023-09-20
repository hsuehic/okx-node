import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ProCard } from '@ant-design/pro-components';
import { Table, TableColumnType } from 'antd';
import { WsPosition } from 'okx-node';

import { formatPrice } from '../formatter';

import { renderUpl, renderUplRatio } from './renderer';

const columnsIsolated: TableColumnType<WsPosition>[] = [
  {
    dataIndex: 'posId',
    title: 'Position Id',
  },
  {
    dataIndex: 'instId',
    title: 'Instrument Id',
    render: (value: InstId) => {
      return <Link to={`/market/inst/${value}`}>{value}</Link>;
    },
  },
  {
    dataIndex: 'mgnMode',
    title: 'Margin Mode',
  },
  {
    title: 'Base Balance',
    render(_: unknown, record: WsPosition) {
      const { baseBal, baseBorrowed } = record;
      const v = parseFloat(baseBal) - parseFloat(baseBorrowed);
      return v.toString();
    },
  },
  {
    title: 'Quote Balance',
    render(_: unknown, record: WsPosition) {
      const { quoteBal, quoteBorrowed } = record;
      const v = parseFloat(quoteBal) - parseFloat(quoteBorrowed);
      return v.toString();
    },
  },
  {
    dataIndex: 'markPx',
    title: 'Price',
    render: formatPrice,
  },
  {
    dataIndex: 'liqPx',
    title: 'Liquidation Price',
  },
  {
    dataIndex: 'upl',
    title: 'Total Change',
    render: renderUpl,
  },
  {
    dataIndex: 'uplRatio',
    title: 'UPL Ratio',
    render: renderUplRatio,
  },
];

const columnsCross: TableColumnType<WsPosition>[] = [
  {
    dataIndex: 'posId',
    title: 'Position Id',
  },
  {
    dataIndex: 'instId',
    title: 'Instrument Id',
    render: (value: InstId) => {
      return <Link to={`/market/inst/${value}`}>{value}</Link>;
    },
  },
  {
    dataIndex: 'mgnMode',
    title: 'Margin Mode',
  },
  {
    title: 'Base',
    render(_: unknown, record: WsPosition) {
      const { ccy, posCcy, pos, liab } = record;
      const v = ccy === posCcy ? pos : liab;
      return v;
    },
  },
  {
    title: 'Quote',
    render(_: unknown, record: WsPosition) {
      const { ccy, posCcy, pos, liab } = record;
      const v = ccy === posCcy ? liab : pos;
      return v;
    },
  },
  {
    dataIndex: 'markPx',
    title: 'Price',
    render: (v: string) => {
      return formatPrice(v);
    },
  },
  {
    dataIndex: 'liqPx',
    title: 'Liquidation Price',
  },
  {
    dataIndex: 'upl',
    title: 'Total Change',
    render: renderUpl,
  },
  {
    dataIndex: 'uplRatio',
    title: 'UPL Ratio',
    render: renderUplRatio,
  },
];

export const PositionList = () => {
  const { wsAccount: account } = window;

  const [dataSource, setDataSource] = useState<WsPosition[]>(
    account.position || []
  );
  const handler = useCallback((data: WsPosition[]) => {
    setDataSource(data);
  }, []);
  useEffect(() => {
    const eventName = 'push-positions';
    account.on(eventName, handler);
    return () => {
      account.off(eventName, handler);
    };
  });
  return (
    <>
      <ProCard.Group title="Isolated Margin">
        <ProCard>
          <Table<WsPosition>
            loading={!dataSource}
            columns={columnsIsolated}
            dataSource={dataSource.filter(
              record =>
                record.instType === 'MARGIN' && record.mgnMode === 'isolated'
            )}
            rowKey={'instId'}
            pagination={false}
          />
        </ProCard>
      </ProCard.Group>
      <ProCard.Group title="Cross Margin">
        <ProCard>
          <Table<WsPosition>
            loading={!dataSource}
            columns={columnsCross}
            dataSource={dataSource.filter(
              record =>
                record.instType === 'MARGIN' && record.mgnMode === 'cross'
            )}
            rowKey={'instId'}
            pagination={false}
          />
        </ProCard>
      </ProCard.Group>
    </>
  );
};
