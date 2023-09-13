import { OrderBook, Ticker, WsPushArgInstId } from 'okx-node';

import '../../../election.d.ts';
import { usePush } from '../hooks/websock';

import styles from './order-book.module.scss';

export interface WsOrderBook extends OrderBook {
  instId: string;
}

export interface OrderBookComponentProps {
  instId: string;
  price: string;
  books: WsOrderBook;
}

const renderBookLevels = (currentPrice: string, books?: WsOrderBook) => {
  if (!books) {
    return null;
  } else {
    const { bids, asks } = books;
    return (
      <>
        {asks.reverse().map(([price, amount, _, orders], index) => {
          return (
            <li className={styles.bookLevel} key={`ask-${index}`}>
              <span className="color-down">{price}</span>
              <span>{amount}</span>
              <span>{orders}</span>
            </li>
          );
        })}
        <li className={`${styles.currentPrice} color-up`}>
          {(currentPrice && parseFloat(currentPrice).toLocaleString()) || ' '}
        </li>

        {bids.map(([price, amount, _, orders], index) => {
          return (
            <li className={styles.bookLevel} key={`bid-${index}`}>
              <span className="color-up">{price}</span>
              <span>{amount}</span>
              <span>{orders}</span>
            </li>
          );
        })}
      </>
    );
  }
};

export const OrderBookComponent = (props: OrderBookComponentProps) => {
  const { price: currentPrice, books, instId } = props;
  const [cy, quote] = instId.split('-');
  return (
    <ul className={styles.book}>
      <li className={styles.bookHeader}>
        <span>Pirce({quote})</span>
        <span>Amount({cy})</span>
        <span>Order</span>
      </li>
      {renderBookLevels(currentPrice, books)}
    </ul>
  );
};

export interface OrderBookContainerProps {
  instId: string;
}
export const OrderBookContainer = ({ instId }: OrderBookContainerProps) => {
  const [books5] = usePush<WsPushArgInstId, WsOrderBook>(
    'books5',
    arg => {
      return arg.instId === instId;
    },
    [instId]
  );
  const [ticker] = usePush<WsPushArgInstId, Ticker>(
    'tickers',
    arg => {
      return arg.instId === instId;
    },
    [instId]
  );

  return (
    <OrderBookComponent
      instId={instId}
      books={books5}
      price={(ticker && ticker.last) || ''}
    />
  );
};
