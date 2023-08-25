import { formatPrice } from '../formatter';

import styles from './ticker-info.module.scss';

export interface TickerInfoProps {
  label: string;
  value: string;
}

export const TickerInfo = ({ label, value }: TickerInfoProps) => {
  return (
    <div className={`${styles.container}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{formatPrice(value)}</div>
    </div>
  );
};
