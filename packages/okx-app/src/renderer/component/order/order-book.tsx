import { useEffect, useState } from 'react';

import { OrderBook, Trade, WsPublicOrderBooksChannel, WsPush } from 'okx-node';

import '../../../election.d.ts';

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
              <span className="color-up">{price}</span>
              <span>{amount}</span>
              <span>{orders}</span>
            </li>
          );
        })}
        <li className={`${styles.currentPrice} color-down`}>
          {(currentPrice && parseFloat(currentPrice).toLocaleString()) || ' '}
        </li>

        {bids.map(([price, amount, _, orders], index) => {
          return (
            <li className={styles.bookLevel} key={`bid-${index}`}>
              <span className="color-down">{price}</span>
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
  const [books5, setBooks5] = useState<WsOrderBook>(undefined);
  const [price, setPrice] = useState('');
  useEffect(() => {
    const books5Handler = (
      data: WsPush<
        { channel: WsPublicOrderBooksChannel; instId: string },
        WsOrderBook
      >
    ): void => {
      if (data.arg.instId === instId) {
        setBooks5(data.data[0]);
      }
    };

    const tradesHandler = ({
      arg,
      data,
    }: WsPush<{ channel: 'trades'; instId: string }, Trade>) => {
      if (arg.instId === instId) {
        setPrice(data[0].px);
      }
    };

    const book5EventName = 'push-books5' as const;
    const tradesEventName = 'push-trades';

    const { wsClient } = window;

    const { on, off } = wsClient;

    on(book5EventName, books5Handler);
    on(tradesEventName, tradesHandler);
    return () => {
      off(book5EventName, books5Handler);
      off(tradesEventName, tradesHandler);
    };
  }, []);

  return <OrderBookComponent instId={instId} books={books5} price={price} />;
};
