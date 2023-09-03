import { useState } from 'react';

import moment from 'moment';
import { Trade, WsPush, WsPushArgInstId } from 'okx-node';

import '../../../election.d.ts';
import { usePush } from '../hooks/websock.js';

import styles from './last-trades.module.scss';

export type WsTradesArg = {
  channel: 'trades';
  instId: string;
};

export type WsPushTrade = WsPush<{ channel: 'trades'; instId: string }, Trade>;

export interface LastTradesProps {
  instId: string;
}

/**
 * Last trades list displaying latest 10 trades.  To use this component, need to subscribe 'trades' channel at page level.
 * @param options, options
 * @returns component
 */
export const LastTrades = ({ instId }: LastTradesProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  let newTrades = [...trades];
  usePush<WsPushArgInstId, Trade>(
    'trades',
    arg => {
      return arg.instId === instId;
    },
    [instId],
    ({ data }) => {
      const item = data[0];
      newTrades = [item, ...newTrades];
      if (newTrades.length > 10) {
        newTrades.pop();
      }
      setTrades(newTrades);
    }
  );
  const [cy, quote] = instId.split('-');
  return (
    <ul className={styles.book}>
      <li className={styles.bookHeader}>
        <span>Pirce({quote})</span>
        <span>Amount({cy})</span>
        <span>Time</span>
      </li>
      {trades.map(({ px, sz, side, ts }, index) => {
        return (
          <li className={styles.bookLevel} key={`ask-${index}`}>
            <span className={side === 'buy' ? 'color-up' : 'color-down'}>
              {px}
            </span>
            <span>{sz}</span>
            <span>{moment(parseInt(ts)).format('HH:mm:ss')}</span>
          </li>
        );
      })}
    </ul>
  );
};
