import { PlusOutlined, ExportOutlined } from '@ant-design/icons';
import { Button, Image, message, Modal } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { get_goods, delete_good, export_goods_xlsx, get_areas_all } from '@/services/fastapi';
import { GoodItem,PageParams } from '@/constant-type';
import AddGoodForm from './components/AddForm';
import UpdateGoodForm from './components/UpdateForm';
import { download_xlsx } from '@/services/util';
import { useRequest } from 'ahooks';
const { confirm } = Modal;

const BASE_PIC_PATH = 'https://fap-1258569581.cos.ap-nanjing.myqcloud.com/';
declare const window:any

const GoodsList: React.FC = () => {

  const [areaEnum, setAreaEnum] = useState<any>({});
  const { data } = useRequest(get_areas_all);

  useEffect(() => {
    let area:any = {};
    if(data && data.length > 0) {
      data.forEach((v:any) => {
          area[v.id] = {
            text: v.name
          };
      });
    }
    setAreaEnum(area);
  }, [data]);
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [visible, setVisible] = useState<{id:number,visible:boolean} | null>(null);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */

  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [editRow, setEditRow] = useState<any>({});
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

function deleteRecord(record:any) {
    if(!record['id']) {
       return;
    }
    confirm({
       title: '确认要删除该条数据吗？',
       onOk: async () => {
        const hide = message.loading('正在删除');
        try {
          await delete_good(record['id']);
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

  async function exportXlsx() {
    const hide = message.loading('正在导出...');
    setIsExporting(true);
    try {
      const res  = await export_goods_xlsx();
      let filename = Date.now() + "_商品列表.xlsx" ;
      // 下载文件
      download_xlsx(res, filename);
      hide();
      message.success('导出成功，即将刷新');
    } catch (error) {
      hide();
      message.error('导出失败，请重试');
    }
    setIsExporting(false);
  }

  function addModelClose(vis:boolean) {
      console.log(vis);
      setCreateModalVisible(vis);
  }


  function updateModelClose(vis:boolean) {
    console.log(vis);
    setUpdateModalVisible(vis);
}
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns: ProColumns<GoodItem>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      search: false,
    },
    {
      title: '名称',
      dataIndex: 'title'
    },
    {
      title: '图片',
      dataIndex: 'picture',
      search: false,
      render: (_,record:any) => {
        const list = record['picture'].split(',');
        return <span><Button type="link" onClick={() => setVisible({id:record['id'],visible:true})}>查看({list.length})</Button>
         <div style={{ display: 'none' }}>
          <Image.PreviewGroup preview={{ 
            visible: visible?.id === record['id'] && visible?.visible, 
            onVisibleChange: vis => setVisible({id:record['id'],visible:vis}) 
            }}>
            {
              list.map((file_name:string) => {
                  return <Image src={BASE_PIC_PATH + file_name} key={file_name}/>
              })
            }
          </Image.PreviewGroup>
        </div>
        </span>
      }
    },
    {
      title: '价格',
      dataIndex: 'price',
      search: false,
    },
    {
      title: '区域',
      dataIndex: 'area_id',
      // search: false,
      valueEnum: areaEnum,
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <Button key="edit_btn" type="link" 
          onClick={() => {
            setEditRow(record);
            console.log(record);
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
      <ProTable<GoodItem, PageParams>
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
          <Button
            type="default"
            key="export"
            loading={isExporting}
            onClick={exportXlsx}
          >
            <ExportOutlined /> 导出
          </Button>,
        ]}
        request={get_goods}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项 &nbsp;&nbsp;
              <span>
                服务调用次数总计 {selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)} 万
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              // await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
          <Button type="primary">批量审批</Button>
        </FooterToolbar>
      )}
      {/* 新增货品 */}
      <AddGoodForm visible={createModalVisible} onClose={addModelClose} onAdd={() => actionRef.current?.reloadAndRest?.()} areaEnum={areaEnum}/>
      {/* 编辑货品 */}
      <UpdateGoodForm visible={updateModalVisible} items={editRow} areaEnum={areaEnum} onClose={updateModelClose} onEdit={() => {
        setUpdateModalVisible(false);
        actionRef.current?.reloadAndRest?.();
      }}/>
    </PageContainer>
  );
};

export default GoodsList;
