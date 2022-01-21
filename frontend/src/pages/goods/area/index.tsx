import { PlusOutlined } from '@ant-design/icons';
import { Button, Image, message, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { get_areas, delete_area, add_area, update_area } from '@/services/fastapi';
import { AreaItem,PageParams } from '@/constant-type';
const { confirm } = Modal;


const AreasList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [visible, setVisible] = useState<{id:number,visible:boolean} | null>(null);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */

  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [editRow, setEditRow] = useState<any>({});

// 新增区域
const handleAdd = async (fields:any) => {
    const hide = message.loading('正在添加');
    try {
      await add_area({ ...fields });
      hide();
      message.success('添加成功');
      return true;
    } catch (error) {
      hide();
      message.error('添加失败，请重试!');
      return false;
    }
  };

// 新增区域
const handleEdit = async (fields:any) => {
    if(!editRow['id']) {
        return;
    }
    const hide = message.loading('正在修改');
    try {
      await update_area(editRow['id'], { ...fields });
      hide();
      message.success('修改成功');
      return true;
    } catch (error) {
      hide();
      message.error('修改失败，请重试!');
      return false;
    }
  };  
function deleteRecord(record:any) {
    if(!record['id']) {
       return;
    }
    confirm({
       title: '确认要删除该条数据吗？',
       onOk: async () => {
        const hide = message.loading('正在删除');
        try {
          await delete_area(record['id']);
          hide();
          message.success('删除成功，即将刷新');
        } catch (error) {
          hide();
          message.error('删除失败，请重试');
        }
        actionRef.current?.reloadAndRest?.();
       }
    });
  }
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns: ProColumns<AreaItem>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      search: false,
    },
    {
      title: '区域名称',
      dataIndex: 'name'
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <Button key="edit_btn" type="link" 
          onClick={() => {
            setEditRow(record);
            setUpdateModalVisible(true);
          }}
        >
          编辑
        </Button>,
        <Button key="delete_btn" type="link" onClick={() => deleteRecord(record)}>
          删除
        </Button>,
      ],
    },
  ];
  return (
    <PageContainer>
      <ProTable<AreaItem, PageParams>
        headerTitle={'查询表格'}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
               setCreateModalVisible(true)
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={get_areas}
        columns={columns}
      />
      <ModalForm
        title={'新增区域'}
        width="400px"
        visible={createModalVisible}
        onVisibleChange={setCreateModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value);
          if (success) {
            setCreateModalVisible(false);
            if (actionRef.current) {
              actionRef.current?.reload();
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: '区域名称为必填项',
            },
          ]}
          width="md"
          placeholder={'请填写区域名称'}
          name="name"
          label="区域名称"
        />
      </ModalForm>
      {
          updateModalVisible ? 
            <ModalForm
                    title={'修改区域'}
                    width="400px"
                    visible={updateModalVisible}
                    onVisibleChange={setUpdateModalVisible}
                    onFinish={async (value) => {
                        const success = await handleEdit(value);
                        if (success) {
                            setUpdateModalVisible(false);
                            if (actionRef.current) {
                            actionRef.current?.reload();
                        }
                    }
                    }}
                    initialValues={{
                        name: editRow['name']
                    }}
                >
                    <ProFormText
                    rules={[{
                            required: true,
                            message: '区域名称为必填项',
                       },
                    ]}
                    width="md"
                    placeholder={'请填写区域名称'}
                    name="name"
                    label="区域名称"
                    />
            </ModalForm>
          : null
      }
    </PageContainer>
  );
};

export default AreasList;
