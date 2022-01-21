import React, {useRef, useState} from 'react';
import { message } from 'antd';
import {
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormDigit,
  ProFormUploadDragger,
  ProFormSelect
} from '@ant-design/pro-form';
import { add_good } from '@/services/fastapi';
import { GoodAdd } from '@/constant-type';
import { useRequest } from 'umi';

export type AddFormProps = {
  visible: boolean;
  onClose: (vis:boolean) => void;
  onAdd: () => void;
  areaEnum: any;
};

const AddGoodForm: React.FC<AddFormProps> = (props) => {
    const {visible, onClose, onAdd, areaEnum, children } = props;
    const uploadedListRef = useRef<any[]>([]);
    const formRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
  
    const { run } = useRequest(add_good, {
      manual: true,
      onSuccess: () => {
        uploadedListRef.current = [];
        message.success('提交成功！');
        formRef.current?.resetFields();
        onAdd?.();
        setIsLoading(false);
      },
      onError: () => {
        message.success('提交失败！');
        setIsLoading(false);
      }
    });
  
    const onFinish = async (values: GoodAdd) => {
      if (uploadedListRef.current.length === 0) {
          message.error('图片不能为空！');
          return;
      }
      delete values.file;
      values.area_id = +values.area_id;
      values.picture = uploadedListRef.current.join(',');
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
    <ModalForm
        title="新增货品"
        width="600px"
        visible={visible}
        trigger={<>{children}</>}
        hideRequiredMark
        name="basic"
        layout="vertical"
        onFinish={onFinish}
        onVisibleChange={onClose}
        formRef={formRef}
        submitter={{
          submitButtonProps: {
            loading: isLoading
          }
        }}
        modalProps={{
            maskClosable: false,
            style:{top: '5%'}
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
          <ProFormSelect
            width="md"
            name="area_id"
            label="上货地区"
            valueEnum={areaEnum}
            placeholder="请选择上货地区"
           />
           <ProFormUploadDragger width="xl" label="货品图片" name="file" max={5} fieldProps={uploadProps} />
      </ModalForm>
  );
};

export default AddGoodForm;
