import { PageContainer, ProCard } from '@ant-design/pro-components';

import { PositionList } from './position-list';

export const Position = () => {
  return (
    <PageContainer
      token={{
        paddingInlinePageContainerContent: 20,
      }}
    >
      <ProCard
        style={{
          minHeight: `calc(100% - 120px)`,
        }}
      >
        <PositionList />
      </ProCard>
    </PageContainer>
  );
};
