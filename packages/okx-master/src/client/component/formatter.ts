import moment from 'moment';

export const setThousandComma = (value: number | string) => {
  const v: string = value.toString();
  const reg = /(\d)(?=(?:\d{3})+(\.\d+)?$)/g;
  return v.replace(reg, '$1,');
};
export const formatPrice = (price: string): string => {
  const v = parseFloat(price);
  return formatValuePrice(v);
};

export const formatValuePrice = (price: number): string => {
  return setThousandComma(price.toFixed(2));
};

export const formatRatio = (ratio: string): string => {
  return formatValueRatio(parseFloat(ratio));
};

export const formatValueRatio = (ratio: number): string => {
  const v = (ratio * 100).toFixed(2);
  return `${v}%`;
};

export const formatUpl = (upl: string): string => {
  const v = parseFloat(upl).toFixed(2);
  return v;
};

export const formatDiffRatio = (last: string, open: string): string => {
  const l = parseFloat(last);
  const o = parseFloat(open);
  return formatValueDiffRatio(l, o);
};

export const formatValueDiffRatio = (l: number, o: number): string => {
  const ratio = (l - o) / o;
  return formatValueRatio(ratio);
};

export const formatTime = (ts: string, format?: string): string => {
  const m = moment(parseInt(ts));
  return m.format(format);
};
