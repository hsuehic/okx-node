import {
  PageContainer,
  ProCard,
  ProDescriptions,
} from '@ant-design/pro-components';
import { Segmented, Switch } from 'antd';
import { AccountConfiguration } from 'okx-node';

const { Item } = ProDescriptions;

export const Config = () => {
  return (
    <PageContainer
      token={{
        paddingInlinePageContainerContent: 20,
      }}
    >
      <ProCard>
        <ProDescriptions
          column={1}
          request={async () => {
            const data = await window.restClient.getAccountConfiguration();
            console.log(data);
            return { success: true, data: data[0] };
          }}
        >
          <Item dataIndex="uid" title="Uid" />
          <Item dataIndex="mainUid" title="Main Uid" />
          <Item
            dataIndex="acctLv"
            title="Account Level"
            render={(_, entity: AccountConfiguration) => {
              return (
                <Segmented
                  value={entity.acctLv}
                  size="small"
                  options={[
                    {
                      value: '1',
                      label: 'Simple',
                    },
                    {
                      value: '2',
                      label: 'Single-currency Margin',
                    },
                    {
                      value: '3',
                      label: 'Multi-currency Margin',
                    },
                    {
                      value: '4',
                      label: 'Portfolio Margin',
                    },
                  ]}
                />
              );
            }}
          />
          <Item dataIndex="posMode" title="Position Mode" />
          <Item
            dataIndex="autoLoan"
            title="Auto Loan"
            render={(_, entity: AccountConfiguration) => {
              return (
                <Switch
                  size="small"
                  onChange={(v: boolean) => {
                    void window.restClient.setAutoLoan({ autoLoan: v });
                  }}
                  checked={entity.autoLoan}
                />
              );
            }}
          />
          <Item dataIndex="greeksType" title="Greeks Display Type" />
          <Item dataIndex="level" title="User Level" />
          <Item dataIndex="levelTmp" title="Temporary User Level" />
          <Item
            dataIndex="ctlsoMode"
            title="Contract Isolated Settings"
            valueEnum={{
              automatic: 'Auto Transfer',
              autonomy: 'Manual Transfer',
            }}
          />
          <Item
            dataIndex="mgnIsoMode"
            title="Margin Isolated Settings"
            valueEnum={{
              automatic: 'Auto Transfer',
              quick_margin: 'Quick Margin Mode',
            }}
          />
          <Item
            dataIndex="spotOffsetType"
            title="Risk Offset Type"
            valueEnum={{
              '1': 'USDT',
              '2': 'Coin',
              '3': 'Derivatives',
            }}
          />
          <Item
            dataIndex="roleType"
            title="Role Type"
            valueEnum={{
              '0': 'General user',
              '1': 'Leading trader',
              '2': 'Copy trader',
            }}
          />
        </ProDescriptions>
      </ProCard>
    </PageContainer>
  );
};
