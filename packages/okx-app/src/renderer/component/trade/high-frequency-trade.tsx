import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Button, Col, Row, Space, Table, TableColumnType } from 'antd';
import { Ticker, WsOrder, WsPushArg } from 'okx-node';

import { InstPageSubTitle, InstPageTitle } from '../common';
import { usePush, useSubscribe } from '../hooks';
import { LastTrades } from '../market/last-trades';
import { OrderBookContainer } from '../market/order-book';

import { HighFrequency, HighFrequencyConfigs } from './high-frequency';

import styles from './high-frequency-trade.module.scss';

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

// subscribing and unsubscribing will be done at page level. Consuming push data will be done at component level.
export const HighFrequencyTrade = () => {
  const formRef = useRef<ProFormInstance>();
  const params = useParams<{ instId: InstId }>();
  const [instId, setInstId] = useState<InstId>(params.instId || 'BTC-USDC');
  const [pendingOrders, setPendingOrders] = useState<WsOrder[]>([]);
  const [filledOrders, setFilledOrders] = useState<WsOrder[]>([]);
  const [started, setStarted] = useState(false);
  const [highFrequency, setHighFrequency] = useState<HighFrequency>(undefined);

  useSubscribe(['books5', 'trades', 'tickers'], instId, [instId]);

  useEffect(() => {
    const arg = {
      channel: 'orders',
      instType: 'MARGIN',
      instId,
    } as const;
    const { wsClient } = window;
    wsClient.subscribe(arg);
    return () => {
      wsClient.unsubscribe(arg);
    };
  }, [instId]);
  const [ticker] = usePush<WsPushArg & { instId: InstId }, Ticker>(
    'tickers',
    (arg: { channel: 'tickers'; instId: InstId }) => {
      return arg.instId === instId;
    },
    [instId]
  );

  return (
    <PageContainer
      token={{
        paddingInlinePageContainerContent: 20,
      }}
      title={
        <InstPageTitle
          key={`title-${instId}`}
          instId={instId}
          onChange={(value: InstId) => {
            setInstId(value);
          }}
        />
      }
      subTitle={
        !!ticker && (
          <InstPageSubTitle key={`sub-title-${instId}`} ticker={ticker} />
        )
      }
    >
      <div className={styles.main}>
        <ProCard direction="column" className={styles.mainBody}>
          <ProCard headerBordered title="Settings">
            <ProForm
              formRef={formRef}
              layout="horizontal"
              grid={true}
              submitter={{
                render: props => {
                  return (
                    <Row>
                      <Col span={8} offset={0}>
                        <Row>
                          <Col span={13} offset={11}>
                            <Space>
                              <Button
                                type="primary"
                                key="submit"
                                onClick={() => props.form?.submit?.()}
                              >
                                {started ? 'Stop' : 'Start'}
                              </Button>

                              <Button
                                type="default"
                                key="reset"
                                disabled={started}
                                onClick={() => props.form?.resetFields()}
                              >
                                Reset
                              </Button>
                            </Space>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  );
                },
              }}
              labelCol={{
                span: 11,
              }}
              wrapperCol={{
                span: 12,
              }}
              onFinish={async (values: HighFrequencyConfigs) => {
                if (started) {
                  highFrequency.stop();
                  setHighFrequency(undefined);
                } else {
                  const hf = new HighFrequency(
                    instId,
                    {
                      ...values,
                    },
                    (pOrders, fOrders) => {
                      setPendingOrders(pOrders);
                      setFilledOrders(fOrders);
                    }
                  );
                  hf.start();
                  setHighFrequency(hf);
                }
                setStarted(!started);
                return Promise.resolve(true);
              }}
            >
              <ProFormDigit
                disabled={started}
                colProps={{ span: 8 }}
                placeholder={''}
                name="basePx"
                label="Base Price"
                rules={[{ required: true, message: 'Required' }]}
              />
              <ProFormDigit
                disabled={started}
                colProps={{ span: 8 }}
                placeholder={''}
                name="gap"
                label="Gap"
                rules={[{ required: true, message: 'Required' }]}
              />
              <ProFormDigit
                disabled={started}
                colProps={{ span: 8 }}
                placeholder={''}
                name="baseSz"
                label="Base Size"
                rules={[{ required: true, message: 'Required' }]}
              />
              <ProFormDigit
                disabled={started}
                colProps={{ span: 8 }}
                placeholder={''}
                name="levelCount"
                label="Level Count"
                rules={[{ required: true, message: 'Required' }]}
              />
              <ProFormDigit
                disabled={started}
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
        </ProCard>
        <div className={styles.mainAside}>
          <ProCard title="Books" style={{ marginBottom: '12px' }}>
            <OrderBookContainer key={`order-book-${instId}`} instId={instId} />
          </ProCard>
          <ProCard title="Last Trades">
            <LastTrades key={`last-trades-${instId}`} instId={instId} />
          </ProCard>
        </div>
      </div>
    </PageContainer>
  );
};
