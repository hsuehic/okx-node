import { Select } from 'antd';

import {
  INST_ID_SUPPORTED,
  MARGIN_INST_ID_SUPPORTED,
  SWAP_INST_ID_SUPPORTED,
} from '../constant';

export type InstSelectProps =
  | {
      type: 'MARGIN';
      instId: InstIdMargin;
      onChange?: (value: InstIdMargin) => void;
    }
  | {
      type: 'SWAP';
      instId: InstIdSwap;
      onChange?: (value: InstIdSwap) => void;
    }
  | {
      type: 'ALL';
      instId: InstId;
      onChange?: (value: InstId) => void;
    };

export const InstSelect = (props: InstSelectProps) => {
  const { type, instId, onChange } = props;
  switch (type) {
    case 'SWAP':
      return (
        <Select
          showSearch
          options={SWAP_INST_ID_SUPPORTED.map(id => ({ value: id, label: id }))}
          value={instId}
          onChange={onChange}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      );
    case 'MARGIN':
      return (
        <Select
          showSearch
          options={MARGIN_INST_ID_SUPPORTED.map(id => ({
            value: id,
            label: id,
          }))}
          value={instId}
          onChange={onChange}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      );
    case 'ALL':
      return (
        <Select
          showSearch
          options={INST_ID_SUPPORTED.map(id => ({
            value: id,
            label: id,
          }))}
          value={instId}
          onChange={onChange}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      );
  }
};
