import { CLS_COLOR_DOWN, CLS_COLOR_UP } from '../constant';
import { formatPrice, formatRatio, formatUpl } from '../formatter';

export const renderPrice = (value: string) => {
  const v = formatPrice(value);
  return v;
};

export const renderUplRatio = (value: string) => {
  const v = formatRatio(value);
  return (
    <span className={parseFloat(value) < 0 ? CLS_COLOR_DOWN : CLS_COLOR_UP}>
      {v}
    </span>
  );
};

export const renderUpl = (value: string) => {
  const v = formatUpl(value);
  return (
    <span className={parseFloat(value) < 0 ? CLS_COLOR_DOWN : CLS_COLOR_UP}>
      {v}
    </span>
  );
};
