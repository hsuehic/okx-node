import type { CSSProperties } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FacebookOutlined,
  GoogleOutlined,
  LockOutlined,
  MobileOutlined,
  TwitterOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Divider, Space, Tabs, message } from 'antd';

import { login } from '../api/login';

type LoginType = 'phone' | 'account';

const iconStyles: CSSProperties = {
  color: 'rgba(0, 0, 0, 0.2)',
  fontSize: '18px',
  verticalAlign: 'middle',
  cursor: 'pointer',
};

export const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<LoginType>('account');
  return (
    <ProConfigProvider hashed={false}>
      <LoginFormPage
        onFinish={async (data: { username: string; password: string }) => {
          const { username, password } = data;
          try {
            await login(username, password);
            navigate('/');
            return true;
          } catch (ex) {
            void message.error(ex as string);
            return false;
          }
        }}
        onFocus={e => {
          console.log(e);
        }}
        logo="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
        title="Crypo Master"
        subTitle="Most professional crypo exchanger"
        submitter={{
          searchConfig: {
            submitText: 'Login',
          },
        }}
        actions={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Divider plain>
              <span
                style={{ color: '#CCC', fontWeight: 'normal', fontSize: 14 }}
              >
                Other Authentications
              </span>
            </Divider>
            <Space align="center" size={24}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  height: 40,
                  width: 40,
                  border: '1px solid #D4D8DD',
                  borderRadius: '50%',
                }}
              >
                <GoogleOutlined style={{ ...iconStyles, color: '#1677FF' }} />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  height: 40,
                  width: 40,
                  border: '1px solid #D4D8DD',
                  borderRadius: '50%',
                }}
              >
                <FacebookOutlined style={{ ...iconStyles, color: '#FF6A10' }} />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  height: 40,
                  width: 40,
                  border: '1px solid #D4D8DD',
                  borderRadius: '50%',
                }}
              >
                <TwitterOutlined style={{ ...iconStyles, color: '#333333' }} />
              </div>
            </Space>
          </div>
        }
      >
        <Tabs
          centered
          activeKey={loginType}
          onChange={activeKey => setLoginType(activeKey as LoginType)}
          items={[
            {
              key: 'account',
              label: 'User Name',
              children: (
                <>
                  <ProFormText
                    name="username"
                    fieldProps={{
                      size: 'large',
                      prefix: <UserOutlined className={'prefixIcon'} />,
                    }}
                    placeholder={'Email address or phone number'}
                    rules={[
                      {
                        required: true,
                        message: 'Please input username!',
                      },
                    ]}
                  />
                  <ProFormText.Password
                    name="password"
                    fieldProps={{
                      size: 'large',
                      prefix: <LockOutlined className={'prefixIcon'} />,
                    }}
                    placeholder={'Password'}
                    rules={[
                      {
                        required: true,
                        message: 'Please input password',
                      },
                    ]}
                  />
                </>
              ),
            },

            {
              key: 'phone',
              label: 'Mobile Number',
              children: (
                <>
                  <ProFormText
                    fieldProps={{
                      size: 'large',
                      prefix: <MobileOutlined className={'prefixIcon'} />,
                    }}
                    name="mobile"
                    placeholder={'Mobile Phone Number'}
                    rules={[
                      {
                        required: true,
                        message: 'Please input Mobile Phone Number',
                      },
                      {
                        pattern: /^1\d{10}$/,
                        message: 'Invalid format',
                      },
                    ]}
                  />
                  <ProFormCaptcha
                    fieldProps={{
                      size: 'large',
                      prefix: <LockOutlined className={'prefixIcon'} />,
                    }}
                    captchaProps={{
                      size: 'large',
                    }}
                    placeholder={'Please input captcha'}
                    captchaTextRender={(timing, count) => {
                      if (timing) {
                        return `${count} ${'Send'}`;
                      }
                      return 'Get captchar';
                    }}
                    name="captcha"
                    rules={[
                      {
                        required: true,
                        message: 'Please input captcha',
                      },
                    ]}
                    onGetCaptcha={async () => {
                      await message.success('Succeed. Your captchar is: 1234');
                    }}
                  />
                </>
              ),
            },
          ]}
        />
        <div
          style={{
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            Automatic login
          </ProFormCheckbox>
          <a
            style={{
              float: 'right',
            }}
          >
            Forgot password
          </a>
        </div>
      </LoginFormPage>
    </ProConfigProvider>
  );
};
