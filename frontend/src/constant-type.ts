export type CurrentUser = {
    id?:number,
    name?: string;
    avatar?: string;
    userid?: string | number;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
  };

  export type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  export type PageParams = {
    current?: number;
    pageSize?: number;
  };

  export type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  export type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  export type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  export type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  export type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  export type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  export type NoticeIconItemType = 'notification' | 'message' | 'event';

  export type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  export type LoginNewResult = {
    detail?:string;
    access_token?:string;
    refresh_token?:string;
    token_type?:string;
  };

export type GoodList = {
    data?: GoodItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
}

export type GoodItem = { 
      key?: number;
      title?: string;
      picture?: string;
      price?: number;
      area_id?: number;
      description?: string;
      id?: number;
}

export type GoodAdd = { 
    title: string;
    picture: string;
    price: number;
    area_id: number;
    description: string;
    file?:string;
}

export type AreaAdd = { 
  name: string;
}

export type AreaItem = { 
  key?: number;
  name?: string;
}