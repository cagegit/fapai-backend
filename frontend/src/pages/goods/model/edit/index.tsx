import { Card, Skeleton, message,Row, Col, Button } from 'antd';
import type { FC } from 'react';
import React, { useState, useRef, Suspense, useEffect } from 'react';
import ProForm, {ProFormText, ProFormTextArea} from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history, useModel} from 'umi'
import {update_model} from "@/services/fastapi"

const JoditEditor:any = React.lazy(() => import("jodit-react"));


type InternalNamePath = (string | number)[];



interface ErrorField {
  name: InternalNamePath;
  errors: string[];
}

const ModelEditForm: FC<any> = (props) => {
  const {model}  = useModel('mod', (ret) => ({model: ret.model}));
  const editor1 = useRef<any>(null);
  const editor2 = useRef<any>(null);
  const editor3 = useRef<any>(null);
  
  const formIns = useRef<any>(null);
  const modelRef = useRef<any>(null);

  const [content1, setContent1] = useState<string>('');
  const [content2, setContent2] = useState<string>('');
  const [content3, setContent3] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [error, setError] = useState<ErrorField[]>([]);

  const onFinish = async (values: Record<string, any>) => {
    if(!model?.id) {
       return;
    }  
    console.log(values);
    if(!content1) {
      message.error('标的物模版不能为空');
       return;
    }
    if(!content2) {
      message.error('拍卖须知不能为空');
      return;
    }
    if(!content3) {
      message.error('拍卖公告不能为空');
      return;
    }
    setError([]);
    try {
      setIsLoading(true);
      await update_model(model.id,{
        title: values.title,
        description: values.description || '',
        bdw_info: content1,
        pmxz_info: content2,
        pmgg_info: content3,
      });
      message.success('修改成功');
      history.goBack();
    } catch(err) {
      // console.log
      message.error('修改失败，请重试！');
    }
    setIsLoading(false);
  };

  // 重置表单
  const onReset = () => {
      setContent1('')
      setContent2('')
      setContent3('')
  }

  const onFinishFailed = (errorInfo: any) => {
    setError(errorInfo.errorFields);
  };

  useEffect(() => {
    if(formIns.current) {
        formIns.current?.resetFields();
        formIns.current?.setFieldsValue({
            title: model?.title, 
            description: model?.description
        })
    }
    setContent1(model?.bdw_info || '');
    setContent2(model?.pmxz_info || '');
    setContent3(model?.pmgg_info || '');
  }, [model]);

  const goBack =() => {
      history.go(-1);
  }

  const content = (
    <div style={{padding: '0 10px', display: 'flex', justifyContent: 'space-between'}}>
      <p>
        编辑模版
      </p>
      <p >
          <Button type='link' onClick={goBack}>返回列表</Button>
      </p>
    </div>
  );

  return <>{
      model ? 
    <ProForm
      formRef={formIns}
      layout="vertical"
      hideRequiredMark
      submitter={{
        render: (props, dom) => {
          return (
            <FooterToolbar>
              {dom}
            </FooterToolbar>
          );
        },
        submitButtonProps:{
          loading: isLoading,
          children: '修改'
        }
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      onReset={onReset}
    >
      <PageContainer title="模版管理" content={content}>
      <Card title="基础信息" style={{ marginBottom: 24}} bordered={false}>
          <Row gutter={16}>
            <Col lg={24} md={24} sm={24}>
              <ProFormText
                label={'模版名称'}
                name="title"
                required={true}
                rules={[{ required: true, message: '请输入模版名称' }]}
                placeholder="请输入模版名称"
              />
            </Col>
            <Col lg={24} md={24} sm={24}>
              <ProFormTextArea
                label={'模版描述'}
                name="description"
                required={false}
                rules={[{ required: true, message: '请填写模版描述' }]}
                placeholder="请填写模版描述"
              />
            </Col>
          </Row>
        </Card>
        <Card title="标的物介绍" style={{ marginBottom: 24}} bordered={false}>
            <Suspense fallback={<Skeleton />}>
                    <JoditEditor
                            ref={editor1}
                            value={content1}
                            config={{readonly:false,height:500}}
                            tabIndex={1} // tabIndex of textarea
                    onBlur={(newContent:string) => {
                      console.log(newContent);
                      setContent1(newContent);
                    }} // preferred to use only this option to update the content for performance reasons
                    onChange={(newContent:string) => {}} />
            </Suspense> 
        </Card>
        <Card title="拍卖须知"  style={{ marginBottom: 24}} bordered={false}>
            <Suspense fallback={<Skeleton />}>
                    <JoditEditor
                            ref={editor2}
                            value={content2}
                            config={{readonly:false,height:500}}
                            tabIndex={1} // tabIndex of textarea
                    onBlur={(newContent:string) => setContent2(newContent)} // preferred to use only this option to update the content for performance reasons
                    onChange={(newContent:string) => {}} />
            </Suspense> 
        </Card>
        <Card title="拍卖公告" bordered={false}>
           <Suspense fallback={<Skeleton />}>
                    <JoditEditor
                            ref={editor3}
                            value={content3}
                            config={{readonly:false,height:500}}
                            tabIndex={1} // tabIndex of textarea
                    onBlur={(newContent:string) => setContent3(newContent)} // preferred to use only this option to update the content for performance reasons
                    onChange={(newContent:string) => {}} />
            </Suspense>        
        </Card>
      </PageContainer>
    </ProForm>
      : null
  }</>;
};

export default ModelEditForm;