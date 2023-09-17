import { formatTime } from './formatter';

export const renderTime = (ts: string, format?: string) => {
  return formatTime(ts, format || 'DD/MM/yy HH:mm:ss');
};
