import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import {
  GithubFilled,
  InfoCircleFilled,
  LogoutOutlined,
  PlusCircleFilled,
  QuestionCircleFilled,
  SearchOutlined,
} from '@ant-design/icons';
import type { MenuDataItem, ProSettings } from '@ant-design/pro-components';
import {
  ProConfigProvider,
  ProLayout,
  // SettingDrawer,
} from '@ant-design/pro-components';
import { ConfigProvider, Dropdown, Input, theme } from 'antd';
import enUS from 'antd/locale/en_US';

import { appRoutes } from './routes';

import './App.scss';

const SearchInput = () => {
  const { token } = theme.useToken();
  return (
    <div
      key="SearchOutlined"
      aria-hidden
      style={{
        display: 'flex',
        alignItems: 'center',
        marginInlineEnd: 24,
      }}
      onMouseDown={e => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Input
        style={{
          borderRadius: 4,
          marginInlineEnd: 12,
          backgroundColor: token.colorBgTextHover,
        }}
        prefix={
          <SearchOutlined
            style={{
              color: token.colorTextLightSolid,
            }}
          />
        }
        placeholder="Search"
        bordered={false}
      />
      <PlusCircleFilled
        style={{
          color: token.colorPrimary,
          fontSize: 24,
        }}
      />
    </div>
  );
};

export const App = () => {
  const [settings] = useState<Partial<ProSettings> | undefined>({
    fixSiderbar: true,
    layout: 'mix',
    splitMenus: false,
    navTheme: 'realDark',
    siderMenuType: 'sub',
    contentWidth: 'Fluid',
    colorPrimary: '#1677FF',
  });

  const { pathname } = useLocation();
  if (typeof document === 'undefined') {
    return <div />;
  }
  return (
    <div
      id="test-pro-layout"
      className="theme-dark"
      style={{
        height: '100vh',
        overflow: 'auto',
      }}
    >
      <ProConfigProvider hashed={false}>
        <ConfigProvider
          getTargetContainer={() => {
            return document.getElementById('test-pro-layout') || document.body;
          }}
          locale={enUS}
        >
          <ProLayout
            route={{ children: appRoutes }}
            location={{
              pathname,
            }}
            token={{
              header: {
                colorBgMenuItemSelected: 'rgba(0,0,0,0.04)',
              },
              pageContainer: {
                paddingBlockPageContainerContent: 12,
                paddingInlinePageContainerContent: 12,
              },
            }}
            siderMenuType="group"
            menu={{
              collapsedShowGroupTitle: false,
            }}
            avatarProps={{
              src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
              size: 'small',
              render: (_props, dom) => {
                return (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'logout',
                          icon: <LogoutOutlined />,
                          label: 'Logout',
                        },
                      ],
                    }}
                  >
                    {dom}
                  </Dropdown>
                );
              },
            }}
            logo={
              'https://static.coinall.ltd/cdn/assets/imgs/221/187957948BD02D97.png'
            }
            title="Crypo Master"
            actionsRender={props => {
              if (props.isMobile) return [];
              if (typeof window === 'undefined') return [];
              return [
                props.layout !== 'side' && document.body.clientWidth > 1200 ? (
                  <SearchInput />
                ) : undefined,
                <InfoCircleFilled
                  key="InfoCircleFilled"
                  onClick={() => {
                    window.open(
                      'https://github.com/hsuehic/okx-node/tree/main/packages/okx-app'
                    );
                  }}
                />,
                <QuestionCircleFilled
                  key="QuestionCircleFilled"
                  onClick={() => {
                    window.open('https://github.com/hsuehic/okx-node/issues');
                  }}
                />,
                <GithubFilled
                  key="GithubFilled"
                  onClick={() => {
                    window.open('https://github.com/hsuehic/okx-node');
                  }}
                />,
              ];
            }}
            headerTitleRender={(logo, title, _) => {
              const defaultDom = (
                <a>
                  {logo}
                  {title}
                </a>
              );
              if (typeof window === 'undefined') return defaultDom;
              if (document.body.clientWidth < 1400) {
                return defaultDom;
              }
              if (_.isMobile) return defaultDom;
              return <>{defaultDom}</>;
            }}
            menuFooterRender={props => {
              if (props?.collapsed) return undefined;
              return (
                <div
                  style={{
                    textAlign: 'center',
                    paddingBlockStart: 12,
                  }}
                >
                  <div>© 2023</div>
                </div>
              );
            }}
            onMenuHeaderClick={e => console.log(e)}
            menuItemRender={(item: MenuDataItem, dom) => {
              const reg = /^https?:/;
              const { path } = item;
              if (reg.test(path || '')) {
                return (
                  <a href={path} target="_blank">
                    {dom}
                  </a>
                );
              } else {
                return (
                  <Link to={(item.defaultPath || item.path) as string}>
                    {dom}
                  </Link>
                );
              }
            }}
            {...settings}
          >
            <Outlet />
            {/* <SettingDrawer
              pathname={pathname}
              enableDarkTheme
              getContainer={(e: unknown) => {
                if (typeof window === 'undefined') return e;
                return document.getElementById('test-pro-layout');
              }}
              settings={settings}
              onSettingChange={changeSetting => {
                setSetting(changeSetting);
              }}
              disableUrlParams={false}
            /> */}
          </ProLayout>
        </ConfigProvider>
      </ProConfigProvider>
    </div>
  );
};
