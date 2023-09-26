import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Statistic } from 'antd';
import { AccountBalance } from 'okx-node';

import { getBalance } from '../api/account';
import { useIntervalRequest } from '../hooks';

import { CurrencyList } from './currency-list';

const { Divider } = ProCard;

export const Balance = () => {
  const [accountBalance] = useIntervalRequest<AccountBalance>(getBalance, 2000);
  const loading = !accountBalance;

  return (
    <PageContainer
      token={{
        paddingInlinePageContainerContent: 20,
      }}
    >
      <ProCard.Group title="Equity" loading={loading} direction={'row'}>
        <ProCard>
          <Statistic
            title="Total"
            prefix="$"
            value={accountBalance && accountBalance.totalEq}
            precision={2}
            loading={loading}
          />
        </ProCard>
        <Divider type={'vertical'} />
        <ProCard>
          <Statistic
            title="Effective"
            prefix="$"
            value={accountBalance && accountBalance.adjEq}
            loading={loading}
          />
        </ProCard>
        <Divider type={'vertical'} />
        <ProCard>
          <Statistic
            title="Isolated"
            prefix="$"
            value={accountBalance && accountBalance.isoEq}
            precision={2}
            loading={loading}
          />
        </ProCard>
        <Divider type={'vertical'} />
        <ProCard>
          <Statistic
            prefix="$"
            title="Frozen"
            value={accountBalance && accountBalance.ordFroz}
            loading={loading}
          />
        </ProCard>
      </ProCard.Group>
      <CurrencyList dataSource={accountBalance?.details} />
    </PageContainer>
  );
};
