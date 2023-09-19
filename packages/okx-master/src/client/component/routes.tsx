import { Outlet } from 'react-router-dom';

import {
  AccountBookOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DollarOutlined,
  GlobalOutlined,
  TransactionOutlined,
} from '@ant-design/icons';

import { Dashboard } from './welcome';

export const appRoutes = [
  {
    path: '/',
    name: 'Dashboard',
    icon: <DashboardOutlined />,
    element: <Dashboard />,
  },
  {
    path: '/account',
    name: 'Account',
    icon: <AccountBookOutlined />,
    lazy: async () => {
      const { Account } = await import('./account');
      return {
        Component: Account,
      };
    },
    children: [
      {
        path: 'balance',
        name: 'Balance',
        icon: <CreditCardOutlined />,
        lazy: async () => {
          const { Balance } = await import('./account');
          return {
            Component: Balance,
          };
        },
      },
      {
        path: 'position',
        name: 'Position',
        icon: <CreditCardOutlined />,
        lazy: async () => {
          const { Position } = await import('./account');
          return {
            Component: Position,
          };
        },
      },
      {
        path: 'config',
        name: 'Config',
        icon: <CreditCardOutlined />,
        lazy: async () => {
          const { Config } = await import('./account');
          return {
            Component: Config,
          };
        },
      },
    ],
  },
  {
    path: '/market',
    name: 'Market',
    icon: <GlobalOutlined />,
    element: <Outlet />,
    children: [
      {
        path: 'inst/:instId?',
        name: 'Instrument',
        defaultPath: '/market/inst/BTC-USDC',
        icon: <DollarOutlined />,
        lazy: async () => {
          const { Instrument } = await import('./market');
          return {
            Component: Instrument,
          };
        },
      },
    ],
  },
  {
    name: 'Orders',
    icon: <TransactionOutlined />,
    path: '/order',
    lazy: async () => {
      const { Order } = await import('./order');
      return { Component: Order };
    },
    children: [
      {
        path: 'pending/:instId?',
        defaultPath: '/order/pending/BTC-USDC',
        name: 'Pending',
        icon: <DollarOutlined />,
        lazy: async () => {
          const { PendingOrder } = await import('./order');
          return { Component: PendingOrder };
        },
      },
      {
        path: 'filled/:instId?',
        defaultPath: '/order/filled/BTC-USDC',
        name: 'Filled',
        icon: <DollarOutlined />,
        lazy: async () => {
          const { OrderHistory } = await import('./order');
          return {
            Component: OrderHistory,
          };
        },
      },
    ],
  },
  {
    path: '/trade',
    name: 'Trade',
    icon: <GlobalOutlined />,
    element: <Outlet />,
    children: [
      {
        path: 'high-frequency/:instId',
        name: 'High Frequency',
        defaultPath: '/trade/high-frequency/BTC-USDC',
        icon: <DollarOutlined />,
        lazy: async () => {
          const { HighFrequencyTrade } = await import('./trade');
          return {
            Component: HighFrequencyTrade,
          };
        },
      },
    ],
  },
];

export const loginRoutes = [
  {
    path: '/login',
    Component: () => {
      return <h1>Login</h1>;
    },
  },
  {
    path: '/register',
    Component: () => {
      return <h1>Register</h1>;
    },
  },
];
