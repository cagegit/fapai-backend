import { Card, message } from 'antd';
import ProForm, {
  ProFormText,
  ProFormTextArea,
  ProFormUploadDragger,
  ProFormDigit
} from '@ant-design/pro-form';
import { useRequest } from 'umi';
import { useRef, useState } from 'react';
import type { FC } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { add_good } from '@/services/fastapi';
import styles from './style.less';
import { GoodAdd } from '@/constant-type';
// import { InboxOutlined} from '@ant-design/icons'

// const {Dragger} = Upload;

const BasicForm: FC<Record<string, any>> = () => {
  
  const uploadedListRef = useRef<any[]>([]);
  const formRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { run } = useRequest(add_good, {
    manual: true,
    onSuccess: () => {
      message.success('提交成功！');
      formRef.current?.resetFields();
      setIsLoading(false);
    },
    onError: () => {
      message.success('提交失败！');
      setIsLoading(false);
    }
  });

  const onFinish = async (values: GoodAdd) => {
    console.log(values);
    console.log(uploadedListRef.current);
    if (uploadedListRef.current.length === 0) {
        message.error('图片不能为空！');
        return;
    }
    delete values.file;
    values.area_id = 0;
    values.picture = uploadedListRef.current.join(',');
    uploadedListRef.current = [];
    setIsLoading(true);
    run(values);
  };

  const uploadProps = {
    name: 'u_file',
    multiple: true,
    maxCount: 5,
    action: '/api/v1/uploadfile',
    headers: {Authorization: 'Bearer ' + localStorage.getItem('ac_token')},
    onChange(info:any) {
      const { status } = info.file;
      // if (status !== 'uploading') {
      //   console.log(info.file, info.fileList);
      // }
      if (status === 'done') {
        console.log(info);
        if(info?.file?.response?.data) {
           uploadedListRef.current.push(info.file.response.data);
        }
        message.success(`${info.file.name} 上传成功.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 上传失败.`);
      }
    },
    onDrop(e:any) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <PageContainer content="表单页用于向用户收集或验证信息，基础表单常见于数据项较少的表单场景。">
      <Card bordered={false}>
        <ProForm
          hideRequiredMark
          style={{ margin: 'auto', marginTop: 8, maxWidth: 600 }}
          name="basic"
          layout="vertical"
          onFinish={onFinish}
          formRef={formRef}
          submitter={{
            submitButtonProps: {
              loading: isLoading
            }
          }}
        >
          <ProFormText
            width="md"
            label="货品标题"
            name="title"
            rules={[
              {
                required: true,
                message: '请输入标题',
              },
            ]}
            placeholder="标题不能为空！"
          />
           <ProFormDigit
            width="md"
            label="货品价格"
            name="price"
            rules={[
              {
                required: true,
                message: '请输入价格',
              },
            ]}
            placeholder="价格不能为空"
          />
          <ProFormTextArea
            label="货品描述"
            width="xl"
            name="description"
            rules={[
              {
                required: true,
                message: '请输入货品描述',
              },
            ]}
            placeholder="请输入货品描述"
          />
           <ProFormUploadDragger label="货品图片" name="file" max={5} fieldProps={uploadProps} />
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default BasicForm;
