import { request } from 'umi';
import {LoginNewResult,CurrentUser, GoodList, GoodAdd, AreaAdd} from '@/constant-type'

/** 登录接口 POST /api/login/account */
export async function login(body: string) {
    return request<LoginNewResult>('/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: body,
    });
}

// 测试接口 /api/v1/users
export async function getUsers() {
    return request<LoginNewResult>('/api/v1/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
}

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser() {
  return request<CurrentUser>('/api/v1/me', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer '+ localStorage.getItem('ac_token')
    }
  });
}

/** 获取当前的用户 GET /api/currentUser */
export async function rfreshToken() {
  return request<CurrentUser>('/api/v1/refresh_token', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer '+ localStorage.getItem('rf_token')
    }
  });
}

/** 获取商品列表 GET /api/rule */
export async function get_goods (
  params: any,
  options?: { [key: string]: any },
) {
  let data_body:any =null;
  if(params.title) {
    data_body ={title: params.title};
  }
  if(params.description) {
    data_body ={...data_body, description: params.description};
  }
  if(params.area_id) {
    data_body ={...data_body, area_id: +params.area_id};
  }
  return request<GoodList>('/api/v1/goods', {
    method: 'POST',
    params: {
      page: params.current,
      size: params.pageSize,
    },
    ...data_body ? {data: data_body} : null,
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return new Promise(resolve => {
    localStorage.removeItem('ac_token');
    localStorage.removeItem('rf_token');
    localStorage.removeItem('maxRfTime');
    localStorage.removeItem('maxAcTime');
    resolve(true);
  });
}
// 新增商品接口
export async function add_good(params: GoodAdd) {
  return request('/api/v1/good', {
    method: 'POST',
    data: params,
  });
}
// 修改商品接口
export async function update_good(good_id:number, params: GoodAdd) {
  return request('/api/v1/good/' + good_id, {
    method: 'PUT',
    data: params,
  });
}
// 删除商品接口
export async function delete_good(good_id:string) {
  return request('/api/v1/good/' + good_id, {
    method: 'DELETE',
  });
}
// 上传文件
export async function upload_pictures(files: any) {
  console.log(files)
  if(files) {
     return [];
  } 
  const form = new FormData()
  files.forEach((f:any) => {
    form.append('files', f.file)
  });
  return request('/api/v1/uploadfiles', {
    method: 'POST',
    body: form,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 商品导出接口
// 新增商品接口
export async function export_goods_xlsx(title?:string) {
  let url = '/api/v1/output_xlsx';
  if(title) {
    url += '?title=' + title;
  }
  return request(url, {
    method: 'GET',
    responseType: 'arrayBuffer'
  });
}
// ----------------------------- 区域增删改查 --------------------
// 新增商品接口
export async function add_area(params: AreaAdd) {
  return request('/api/v1/area', {
    method: 'POST',
    data: params,
  });
}
// 修改商品接口
export async function update_area(area_id:number, params: AreaAdd) {
  return request('/api/v1/area/' + area_id, {
    method: 'PUT',
    data: params,
  });
}
// 删除商品接口
export async function delete_area(area_id:string) {
  return request('/api/v1/area/' + area_id, {
    method: 'DELETE',
  });
}

export async function get_areas (
  params: any,
  options?: { [key: string]: any },
) {
  return request('/api/v1/areas', {
    method: 'POST',
    params: {
      page: params.current,
      size: params.pageSize,
      ... params.name? {name: params.name} : null
    },
    ...(options || {}),
  });
}

// 获取不分页区域
export async function get_areas_all() {
  return request('/api/v1/areas', {
    method: 'GET',
  });
}
