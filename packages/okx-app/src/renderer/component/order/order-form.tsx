import { useState } from 'react';

import {
  DrawerForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSegmented,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import moment from 'moment';
import {
  TradeMode,
  WsOrderSide,
  WsPlaceOrderParams,
  WsQuickMgnType,
} from 'okx-node';

import { INST_ID_SUPPORTED } from '../constant';
import { useRequest } from '../hooks';

export type SpotOrderType = 'limit' | 'market';

export interface OrderFormProps {
  onOpenChange?: (value: boolean) => void;
  open?: boolean;
  instId?: InstId;
  side?: WsOrderSide;
  tdMode?: TradeMode;
  ordType?: SpotOrderType;
  quickMgnType?: WsQuickMgnType;
}

export const OrderForm = (props: OrderFormProps) => {
  const { open, onOpenChange } = props;
  const [instId, setInstId] = useState(props.instId || 'BTC-USDC');
  const [side, setSide] = useState<WsOrderSide | undefined>(
    props.side || 'buy'
  );
  const [ordType, setOrdType] = useState<SpotOrderType>('limit');
  const [tdMode, setTdMode] = useState<TradeMode>(props.tdMode || 'isolated');
  const [form] = Form.useForm<WsPlaceOrderParams>();
  const [ccy, quote] = instId.split('-');
  const quickMgnType = 'auto_borrow';
  const [avail] = useRequest(async () => {
    const data = await window.restClient.getMaxAvailableTradableAmount({
      instId,
      ccy,
      quickMgnType,
      tdMode,
    });
    return data[0];
  }, [instId, tdMode]);
  const unit = ordType === 'limit' ? ccy : side === 'buy' ? quote : ccy;
  const initialValues = {
    instId,
    side,
    ordType,
    tdMode,
  };
  return (
    <DrawerForm
      title={side === 'buy' ? `Buy ${ccy}` : `Sell ${ccy}`}
      onOpenChange={onOpenChange}
      open={open}
      layout="horizontal"
      initialValues={initialValues}
      labelCol={{
        span: 6,
      }}
      wrapperCol={{
        span: 15,
      }}
      resize={{
        maxWidth: window.innerWidth * 0.6,
        minWidth: 528,
      }}
      form={form}
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
      }}
      onFinish={async (values: WsPlaceOrderParams) => {
        const { wsClient } = window;
        const params: WsPlaceOrderParams = { ...initialValues, ...values };
        params.clOrdId = wsClient.order.getUuid();
        if (params.ordType == 'market') {
          delete params['px'];
        } else {
          params.px = params.px.toString();
        }
        if (params.expTime) {
          params.expTime = moment(params.expTime).toDate().getTime().toString();
        }
        if (params.tdMode === 'isolated') {
          params.quickMgnType = quickMgnType;
        }
        params.sz = params.sz.toString();
        await wsClient.order.placeOrder([params]);
        void message.success('Order submited');
        return true;
      }}
    >
      {!props.instId && (
        <ProFormSelect
          name="instId"
          options={INST_ID_SUPPORTED}
          label="Instrument"
          disabled={!!instId}
          onChange={(value: InstId) => {
            setInstId(value);
          }}
        />
      )}
      {!props.side && (
        <ProFormSelect
          name="side"
          label="Side"
          options={['buy', 'sell']}
          onChange={setSide}
        />
      )}
      <ProFormSelect
        required
        name="ordType"
        options={['limit', 'market']}
        label="Order Type"
        onChange={(value: 'limit' | 'market') => {
          setOrdType(value);
        }}
      ></ProFormSelect>
      <ProFormSegmented
        required
        label="Trade Mode"
        valueEnum={{
          cash: 'cash',
          isolated: 'isolated',
          cross: 'cross',
        }}
        name="tdMode"
        fieldProps={{
          onChange: (value: TradeMode) => {
            setTdMode(value);
          },
        }}
      />
      <ProFormDigit
        required
        name="sz"
        label={`Size(${unit})`}
        min={0}
        extra={
          (avail &&
            (side == 'buy'
              ? `Available: ${avail.availBuy} ${quote}`
              : `Available: ${avail.availSell} ${ccy}`)) ||
          ''
        }
      />
      {ordType === 'limit' && (
        <ProFormDigit required name="px" label="Price" min={0} />
      )}
      <ProFormDateTimePicker name="expTime" label="Expire Time" />
      <ProFormText
        label="Tag"
        name="tag"
        fieldProps={{
          maxLength: 16,
        }}
      />
    </DrawerForm>
  );
};
