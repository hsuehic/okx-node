/**
 * Create sorter function
 * @param props Property names/get-value functions used to sort,
 * @returns sorter function
 */
export const createSorter = <T extends object>(
  ...props: (keyof T | ((v: T) => number | string))[]
): ((a: T, b: T) => -1 | 0 | 1) => {
  return (a: T, b: T) => {
    let p: keyof T | ((v: T) => number | string);
    let vA, vB;
    for (let i = 0; i < props.length; i++) {
      p = props[i];
      if (typeof p === 'function') {
        vA = p(a);
        vB = p(b);
      } else {
        vA = a[p];
        vB = b[p];
      }
      if (vA != vB) {
        return vA < vB ? -1 : 1;
      }
    }
    return 0;
  };
};

export const getCryptoCurrencyIcon = (ccy: CryptoCurrency) => {
  return `https://static.okx.com/cdn/oksupport/asset/currency/icon/${ccy.toLowerCase()}.png?x-oss-process=image/format,webp`;
};
