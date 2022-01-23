import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RunTimeLayoutConfig } from 'umi';
import { history, Link } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from './services/fastapi';
import { CurrentUser } from './constant-type'
import { RequestConfig, request as req_ajax } from 'umi';
import jwt_decode from 'jwt-decode'
import { ConsoleSqlOutlined } from '@ant-design/icons';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';


let cacheRequest:any = {};
let pendingPromise:any = null;
//@ts-ignore
async function authHeaderInterceptor(url: any, options: any){
  let access_token = localStorage.getItem('ac_token');
  let ac_time:any = localStorage.getItem('maxAcTime');
  let rf_time:any = localStorage.getItem('maxRfTime');
  // 检查token是否有效
  if (ac_time && rf_time && url !== '/api/refresh_token') {
    if(pendingPromise) {
       await pendingPromise;
    } else {
      ac_time = parseInt(ac_time);
      rf_time = parseInt(rf_time);
      const nowTime = new Date().getTime();
      if(nowTime <= rf_time && nowTime > ac_time) {
          let resolve_wa:any;
          pendingPromise = new Promise(resolve => {
            resolve_wa = resolve;
          });
          try {
            const res:any = await req_ajax('/api/refresh_token',{
              method: 'GET',
              headers: { Authorization: 'Bearer '+ localStorage.getItem('rf_token')}    
            });
            if (res && res.access_token) {
              localStorage.setItem('ac_token', res.access_token); 
              access_token = res.access_token;
            }
            resolve_wa(null);
            pendingPromise = null;
          } catch(err) {
            console.log(err);
            resolve_wa(null);
            pendingPromise = null;
            localStorage.removeItem('maxRfTime');
            localStorage.removeItem('maxAcTime');
            // 如果刷新token接口失败，直接跳转登录
            location.href = loginPath;
          }
      } else {
        pendingPromise = null;
      }
    }
  }
  if(url !== '/api/token' && url !== '/api/refresh_token' && access_token) { 
     return {
       url: url,
       options: {...options, headers: {...options.headers, Authorization: 'Bearer ' + access_token}}
     }
  } else {
    return {
      url: url,
      options: {...options}
    }
  }
};

const errorInterceptor =  async (response: any) => {
  const status = response.status;
  if (status === 401) {
    location.href = loginPath;
  }
  return response;
}

export const request: RequestConfig = {
  timeout: 60000,
  errorConfig: {
    adaptor: (resData) => {
      return {
        ...resData,
        success: resData,
        errorMessage: resData.detail,
      };
    },
  },
  // 新增自动添加AccessToken的请求前拦截器
  requestInterceptors: [authHeaderInterceptor as any], 
  responseInterceptors: [errorInterceptor]
};

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: CurrentUser;
  fetchUserInfo?: () => Promise<CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      // 检查token时间
      checkToken();
      const res = await queryCurrentUser();
      // console.log(res);
      return  {...res, avatar: '/img/ava.png',userid: res.id};
    } catch (error) {
      console.log(error);
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    // console.log(currentUser);
    return {
      fetchUserInfo,
      currentUser,
      settings: {},
    };
  }
  return {
    fetchUserInfo,
    settings: {},
  };
}
// 检验token是否超时
function checkToken() {
    // 解析token时间
    const access_token = localStorage.getItem('ac_token');
    const refresh_token = localStorage.getItem('rf_token');
    if(access_token && refresh_token) {
      let decodeAcToken:any = jwt_decode(access_token);
      let decodeToken:any = jwt_decode(refresh_token);
      if (decodeToken && decodeToken.exp) {
        const maxTime = decodeToken.exp*1000;
        localStorage.setItem('maxRfTime', maxTime+'');
      }
      if(decodeAcToken && decodeAcToken.exp) {
        const maxTime = decodeAcToken.exp*1000;
        localStorage.setItem('maxAcTime', maxTime+'');
      }
    }
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    links: [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};
