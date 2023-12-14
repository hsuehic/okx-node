import {
  DrawerForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';

import { createTrader } from '../api/trader';

export type SpotOrderType = 'limit' | 'market';

export interface SwapTraderFormProps {
  onOpenChange?: (value: boolean) => void;
  open: boolean;
  instId: InstIdSwap;
  price?: number;
  validateTraderName?: (name: string) => undefined | string;
}

export type OkxSwapTraderParams = Omit<OkxSwapTraderConfig, 'type' | 'instId'>;

export const SwapTraderFormItems = () => {
  return (
    <>
      <ProFormSelect
        key={'posSide'}
        colProps={{ span: 8 }}
        placeholder={''}
        name="posSide"
        label="Position Side"
        options={['net', 'long', 'short']}
        rules={[{ required: true, message: 'Required' }]}
      />
      <ProFormDigit
        key={'basePx'}
        colProps={{ span: 8 }}
        placeholder={''}
        name="basePx"
        label="Base Price"
        rules={[{ required: true, message: 'Required' }]}
      />
      <ProFormDigit
        colProps={{ span: 8 }}
        placeholder={''}
        name="gap"
        label="Gap"
        rules={[{ required: true, message: 'Required' }]}
      />
      <ProFormDigit
        colProps={{ span: 8 }}
        placeholder={''}
        name="baseSz"
        label="Base Size"
        rules={[{ required: true, message: 'Required' }]}
      />
      <ProFormDigit
        colProps={{ span: 8 }}
        placeholder={''}
        name="levelCount"
        label="Level Count"
        rules={[{ required: true, message: 'Required' }]}
      />
      <ProFormDigit
        colProps={{ span: 8 }}
        placeholder={''}
        name="minSize"
        label="Minimum Size"
        rules={[{ required: true, message: 'Required' }]}
        min={Number.MIN_SAFE_INTEGER}
      />
      <ProFormDigit
        colProps={{ span: 8 }}
        placeholder={''}
        name="maxSize"
        label="Maximum Size"
        rules={[{ required: true, message: 'Required' }]}
        min={Number.MIN_SAFE_INTEGER}
      />
      <ProFormDigit
        colProps={{ span: 8 }}
        placeholder={''}
        name="coefficient"
        label="Coefficient"
        rules={[{ required: true, message: 'Required' }]}
      />
    </>
  );
};

export const SwapTraderForm = (props: SwapTraderFormProps) => {
  const { open, onOpenChange, instId, price, validateTraderName } = props;
  const [form] = Form.useForm<OkxSwapTraderParams>();
  const [ccy] = instId.split('-');
  return (
    <DrawerForm
      title={`Create new TieredTrader for ${instId}`}
      onOpenChange={onOpenChange}
      open={open}
      initialValues={{
        basePx: price,
        name: `${ccy}`,
        posSide: 'net',
      }}
      layout="horizontal"
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
      onFinish={async (values: OkxSwapTraderParams) => {
        try {
          await createTrader({ ...values, type: 'swap', instId });
          void message.success('Trader added');
          return true;
        } catch (ex) {
          void message.info(ex as string);
        }
      }}
    >
      <ProFormText
        colProps={{ span: 8 }}
        placeholder={'Please input unique name'}
        name="name"
        label="Name"
        rules={[
          {
            required: true,
            message: 'Required',
          },
          {
            validator(rule, value: string, callback) {
              const reg = /^[0-9A-Za-z]+$/;
              if (!reg.test(value)) {
                callback('Can only contain letters and numbers');
              }
              if (validateTraderName) {
                callback(validateTraderName(value));
              }
              callback();
            },
          },
        ]}
      />
      <SwapTraderFormItems />
    </DrawerForm>
  );
};
