import { Link } from 'umi';
import { Result, Button } from 'antd';

export default () => (
  <Result
    status="500"
    title="500"
    style={{
      background: 'none',
    }}
    subTitle="抱歉，服务端异常。"
    extra={
      <Link to="/">
        <Button type="primary">返回首页</Button>
      </Link>
    }
  />
);
