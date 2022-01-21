import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, message } from 'antd';
import React, { useState } from 'react';
import { ProFormText, LoginForm } from '@ant-design/pro-form';
import { history, useModel } from 'umi';
import Footer from '@/components/Footer';
import { login } from '@/services/fastapi';
import styles from './index.less';
import {LoginResult,LoginParams,} from '@/constant-type'

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<LoginResult>({});
  // const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');

  const fetchUserInfo = async () => {
    let userInfo = await initialState?.fetchUserInfo?.();

    if (userInfo) {
      userInfo = {...userInfo, avatar: '/img/ava.png',userid: userInfo.id};
      await setInitialState((s) => ({ ...s, currentUser: userInfo }));
    }
  };

  const handleSubmit = async (values: LoginParams) => {
    try {
      // 登录
      const {username, password} = values;
      const res = await login(`username=${username}&password=${password}`);
      console.log(res)
      if (res && res.access_token && res.refresh_token) {
        const defaultLoginSuccessMessage = '登录成功！';
        message.success(defaultLoginSuccessMessage);
        localStorage.setItem('ac_token', res.access_token);
        localStorage.setItem('rf_token', res.refresh_token);
        await fetchUserInfo();
        /** 此方法会跳转到 redirect 参数所在的位置 */

        if (!history) return;
        const { query } = history.location;
        const { redirect } = query as {
          redirect: string;
        };
        history.push(redirect || '/');
        return;
      }
      setUserLoginState({status: 'error'});
    } catch (error) {
      console.log(error);
      const defaultLoginFailureMessage = '登录失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }
  };

  const { status } = userLoginState;
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm
          logo={<img alt="logo" src="/logo.svg" />}
          title="货品管理系统"
          subTitle={'纯手工制造'}
          initialValues={{
            autoLogin: true,
          }}
          actions={[]}
          onFinish={async (values) => {
            await handleSubmit(values as LoginParams);
          }}
        >
          {status === 'error' && (
            <LoginMessage content={'错误的手机号和密码'} />
          )}
         <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'手机号: 注册手机号'}
                rules={[
                  {
                    required: true,
                    message: '手机号是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'密码: 输入密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                ]}
              />
          {/* <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
          </div> */}
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
