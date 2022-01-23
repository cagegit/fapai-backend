import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, List, Typography,message } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { useRequest, history, useModel } from 'umi';
import styles from './style.less';
import { useEffect} from 'react';
import { get_model_all } from '@/services/fastapi';

const { Paragraph } = Typography;

const CardList = () => {
  const {setMd}  =useModel('mod', (ret) => ({
    setMd: ret.setMd
  }))
  const { data, loading } = useRequest(() => {
    return get_model_all();
  });

  const list = data || [];

  const content = (
    <div className={styles.pageHeaderContent}>
      <p>
        模版列表管理
      </p>
    </div>
  );
  const nullData: Partial<any> = {};

  const editItem =(item:any) => {
    setMd(item);
    history.push('/goods/model/edit/'+item.id);
  };

  return (
    <PageContainer content={content}>
      <div className={styles.cardList}>
        <List<Partial<any>>
          rowKey="id"
          loading={loading}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={[nullData, ...list]}
          renderItem={(item) => {
            if (item && item.id) {
              return (
                <List.Item key={item.id}>
                  <Card
                    hoverable
                    className={styles.card}
                    actions={[<Button type="link" size="small" key="option1" onClick={() => editItem(item)}>编辑</Button>, 
                    <Button type="link" size="small" key="option2" onClick={() => {message.error('暂不支持删除')}}>删除</Button>]}
                  >
                    <Card.Meta
                      title={<a>{item.title}</a>}
                      description={
                        <Paragraph className={styles.item} ellipsis={{ rows: 3 }}>
                          {item.description}
                        </Paragraph>
                      }
                    />
                  </Card>
                </List.Item>
              );
            }
            return (
              <List.Item>
                <Button type="dashed" className={styles.newButton} onClick={() => {
                    history.push('/goods/model/add');
                }}>
                  <PlusOutlined /> 新增模版
                </Button>
              </List.Item>
            );
          }}
        />
      </div>
    </PageContainer>
  );
};

export default CardList;