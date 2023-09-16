import {
  DrawerForm,
  ProFormDigit,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';

import { HighFrequencyConfigs } from './high-frequency';
import { traderManager } from './trader-manager';

export type SpotOrderType = 'limit' | 'market';

export interface OrderFormProps {
  onOpenChange?: (value: boolean) => void;
  open: boolean;
  instId: InstId;
}

export interface NewTraderParams extends HighFrequencyConfigs {
  name: string;
}

export const TraderForm = (props: OrderFormProps) => {
  const { open, onOpenChange, instId } = props;
  const [form] = Form.useForm<NewTraderParams>();
  return (
    <DrawerForm
      title={`Create new trader for ${instId}`}
      onOpenChange={onOpenChange}
      open={open}
      initialValues={{
        instId,
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
      onFinish={async (values: NewTraderParams) => {
        const { name, ...config } = values;
        const trader = traderManager.addTrader(name, {
          instId,
          ...config,
        } as HighFrequencyConfigs);
        trader.start();
        void message.success('Trader added');
        return Promise.resolve(true);
      }}
    >
      <ProFormText
        colProps={{ span: 8 }}
        placeholder={'Please input unique name'}
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Required' }]}
      />
      <ProFormDigit
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
        name="coefficient"
        label="Coefficient"
        rules={[{ required: true, message: 'Required' }]}
      />
    </DrawerForm>
  );
};
