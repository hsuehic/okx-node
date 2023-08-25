import { Select } from 'antd';

import { INST_ID_SUPPORTED } from '../constant';

export interface InstSelectProps {
  instId: InstId;
  onChange?: (value: InstId) => void;
}

export const InstSelect = (props: InstSelectProps) => {
  const { instId, onChange } = props;
  return (
    <Select
      showSearch
      options={INST_ID_SUPPORTED.map(id => ({ value: id, label: id }))}
      value={instId}
      onChange={onChange}
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
    />
  );
};
