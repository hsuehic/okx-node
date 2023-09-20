import { useCallback, useEffect, useState } from 'react';

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Statistic } from 'antd';
import { WsAccoutInfo, WsAssetInfo } from 'okx-node';

import { CurrencyList } from './currency-list';

const { Divider } = ProCard;

export const Balance = () => {
  const { wsAccount: account } = window;

  let initialAccountInfo: WsAccoutInfo | undefined = undefined;
  let initialAssetInfo: WsAssetInfo[] | undefined = undefined;
  const info = account.accountInfo;
  if (info && info.length > 0) {
    initialAccountInfo = info[0];
    initialAssetInfo = initialAccountInfo.details;
  }
  const [loading, setLoading] = useState<boolean>(!initialAccountInfo);
  const [accountInfo, setAccountInfo] = useState<WsAccoutInfo | undefined>(
    initialAccountInfo
  );
  const [dataSource, setDataSource] = useState<WsAssetInfo[] | undefined>(
    initialAssetInfo
  );

  const handlerAccountInfo = useCallback(
    (data: WsAccoutInfo[]) => {
      if (data.length > 0) {
        const acc = data[0];
        setAccountInfo(acc);
        const assetInfo = acc.details;
        setDataSource(assetInfo);
        setLoading(false);
      }
    },
    [setAccountInfo, setLoading]
  );

  useEffect(() => {
    const eventName = 'push-account';
    account.on(eventName, handlerAccountInfo);
    return () => {
      account.off(eventName, handlerAccountInfo);
    };
  });
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
            value={accountInfo && accountInfo.totalEq}
            precision={2}
            loading={loading}
          />
        </ProCard>
        <Divider type={'vertical'} />
        <ProCard>
          <Statistic
            title="Effective"
            prefix="$"
            value={accountInfo && accountInfo.adjEq}
            loading={loading}
          />
        </ProCard>
        <Divider type={'vertical'} />
        <ProCard>
          <Statistic
            title="Isolated"
            prefix="$"
            value={accountInfo && accountInfo.isoEq}
            precision={2}
            loading={loading}
          />
        </ProCard>
        <Divider type={'vertical'} />
        <ProCard>
          <Statistic
            prefix="$"
            title="Frozen"
            value={accountInfo && accountInfo.ordFroz}
            loading={loading}
          />
        </ProCard>
      </ProCard.Group>
      <CurrencyList dataSource={dataSource} />
    </PageContainer>
  );
};
