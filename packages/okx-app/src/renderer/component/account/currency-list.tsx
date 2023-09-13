import { ProCard } from '@ant-design/pro-components';
import { Table, TableColumnType } from 'antd';
import { WsAssetInfo } from 'okx-node';

import '../../../election.d.ts';

import styles from './currency-list.module.scss';

const renderEquityInUsd = (v: string) => {
  const value = parseFloat(v || '0');
  return <span>{value.toFixed(2)}</span>;
};

const columns: TableColumnType<WsAssetInfo>[] = [
  {
    dataIndex: 'ccy',
    title: 'Currency',
    render: (ccy: string) => {
      return (
        <>
          <img
            src={`https://static.okx.com/cdn/oksupport/asset/currency/icon/${ccy.toLowerCase()}.png?x-oss-process=image/format,webp`}
            alt={ccy}
            className={styles.imgCcy}
          ></img>
          <span>{ccy}</span>
        </>
      );
    },
  },
  {
    dataIndex: 'eq',
    title: 'Total',
  },
  {
    dataIndex: 'availEq',
    title: 'Available',
  },
  {
    dataIndex: 'isoEq',
    title: 'Isolated',
  },
  {
    dataIndex: 'coinUsdPrice',
    title: 'Price',
  },
  {
    dataIndex: 'eqUsd',
    title: 'Equity($)',
    render: renderEquityInUsd,
  },
  {
    dataIndex: 'disEq',
    title: 'Discount Equity($)',
    render: renderEquityInUsd,
  },
];

export interface CurrencyListProps {
  dataSource?: WsAssetInfo[];
}

export const CurrencyList = ({ dataSource }: CurrencyListProps) => {
  return (
    <ProCard.Group title="Currency">
      <ProCard>
        <Table<WsAssetInfo>
          loading={!dataSource}
          columns={columns}
          dataSource={dataSource}
          rowKey={'ccy'}
          pagination={false}
        />
      </ProCard>
    </ProCard.Group>
  );
};
