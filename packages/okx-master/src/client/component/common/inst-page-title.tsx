import { Ticker } from 'okx-node';

import { getCryptoCurrencyIcon } from '../util';

import { InstSelect } from './inst-selector';
import { Price } from './price';
import { TickerInfo } from './ticker-info';

import styles from './inst-page-title.module.scss';

export type InstPageTitleProps =
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

export const InstPageTitle = (props: InstPageTitleProps) => {
  const { instId } = props;
  const [ccy] = instId.split('-');
  return (
    <>
      <img
        className={styles.logo}
        src={getCryptoCurrencyIcon(ccy as CryptoCurrency)}
        alt={ccy}
      />
      <InstSelect {...props} />
    </>
  );
};

export const InstPageSubTitle = ({ ticker }: { ticker: Ticker }) => {
  const [ccy, quote] = ticker.instId.split('-');
  return (
    <div className={styles.statistics}>
      <Price open={ticker.sodUtc0} last={ticker.last} />
      <TickerInfo label={'High24h'} value={ticker.high24h} />
      <TickerInfo label={'Low24h'} value={ticker.low24h} />
      <TickerInfo label={`Volume24h(${quote})`} value={ticker.volCcy24h} />
      <TickerInfo label={`Volume24h(${ccy})`} value={ticker.vol24h} />
    </div>
  );
};
