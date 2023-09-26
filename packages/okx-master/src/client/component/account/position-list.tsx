import { Link } from 'react-router-dom';

import { ProCard } from '@ant-design/pro-components';
import { Table, TableColumnType } from 'antd';
import { AccountPosition } from 'okx-node';

import { getPositions } from '../api/account';
import { formatPrice } from '../formatter';
import { useIntervalRequest } from '../hooks';

import { renderUpl, renderUplRatio } from './renderer';

const columnsIsolated: TableColumnType<AccountPosition>[] = [
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
    render(_: unknown, record: AccountPosition) {
      const { baseBal, baseBorrowed } = record;
      const v = parseFloat(baseBal) - parseFloat(baseBorrowed);
      return v.toString();
    },
  },
  {
    title: 'Quote Balance',
    render(_: unknown, record: AccountPosition) {
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

const columnsCross: TableColumnType<AccountPosition>[] = [
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
    render(_: unknown, record: AccountPosition) {
      const { ccy, posCcy, pos, liab } = record;
      const v = ccy === posCcy ? pos : liab;
      return v;
    },
  },
  {
    title: 'Quote',
    render(_: unknown, record: AccountPosition) {
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
  const [accountPositions] = useIntervalRequest<AccountPosition[]>(
    getPositions,
    1000,
    []
  );
  const loading = !accountPositions;
  const dataSource = accountPositions || [];

  return (
    <>
      <ProCard.Group title="Isolated Margin">
        <ProCard>
          <Table<AccountPosition>
            loading={loading}
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
          <Table<AccountPosition>
            loading={loading}
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
