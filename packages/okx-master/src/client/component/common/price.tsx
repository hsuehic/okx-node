import { CLS_COLOR_DOWN, CLS_COLOR_UP } from '../constant';
import { formatValueDiffRatio, formatValuePrice } from '../formatter';

import styles from './price.module.scss';

export interface PriceProps {
  open: string;
  last: string;
}

export const Price = ({ open, last }: PriceProps) => {
  const o = parseFloat(open);
  const l = parseFloat(last);
  const cls = l > o ? CLS_COLOR_UP : CLS_COLOR_DOWN;
  return (
    <div className={`${styles.container} ${cls}`}>
      <div className={styles.price}>{formatValuePrice(l)}</div>
      <div className={styles.diff}>{formatValueDiffRatio(l, o)}</div>
    </div>
  );
};
