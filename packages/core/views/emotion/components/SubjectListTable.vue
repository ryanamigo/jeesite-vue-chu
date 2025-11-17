<template>
  <div class="emotion-result-page">
    <div class="content">
      <div class="manage-container">
        <img :src="logoSrc" class="logo-img" />
        <button 
          :disabled="isCollectAccount"
          :class="['batch-btn', { disabled: isCollectAccount }]"
          @click="handleCheckAll"
        >
          全&emsp;选
        </button>
        <button 
          v-if="config.showBatchExport"
          :disabled="isCollectAccount || exportLoading"
          :class="['batch-btn', 'batch-export-btn', { disabled: isCollectAccount }]"
          @click="handleBatchExport"
        >
          {{ exportLoading ? '导出中...' : '批量导出' }}
        </button>
        <button 
          :disabled="isCollectAccount || deleteLoading"
          :class="['batch-btn', 'batch-delete-btn', { disabled: isCollectAccount }]"
          @click="handleBatchDelete"
        >
          {{ deleteLoading ? '删除中...' : '批量删除' }}
        </button>
      </div>
      <Table
        :columns="dynamicColumns"
        :data-source="tableData"
        :row-class-name="getRowClassName"
        class="table-box"
        :row-key="config.rowKey"
        :row-selection="rowSelection"
        :loading="tableLoading"
        :pagination="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Modal, Table, message } from 'ant-design-vue'; 
import { useStorage } from '@vueuse/core';
import { 
  judgmentAccount, 
} from '@jeesite/core/api/emotion/jiance';
import { h } from 'vue';
import { useRouter } from 'vue-router';
import logoSrc from '@jeesite/assets/images/ksh33.png';

// ---------------------- 类型定义 ----------------------
// 页面类型枚举
export type PageType = 
  | 'totalPerson'        // 总人数 (temp.html)
  | 'todayPerson'        // 今日检测人数 (jinrijiancerenshu.html)
  | 'totalTimes'         // 总次数 (zongcishu.html)
  | 'todayTimes'         // 今日检测次数 (jinrijiancecishu.html)
  | 'invalidVideo';      // 无效视频 (wuxiaoshipinshuju.html)

// 行数据基础类型
export interface BaseRowData {
  sid: string;
  pname: string;
  pgender: string;
  pidcard: string;
  ppositionName: string;
  age: number;
  createdAt: string;
}

// 带视频ID的数据类型
export interface VideoRowData extends BaseRowData {
  videoId: string;
  testNumberName?: string;
  annotation?: string;
}

// 统一的行数据类型
export type RowData = BaseRowData | VideoRowData;

// 组件配置接口
export interface TableConfig {
  pageType: PageType;
  type: string; // '0' 或 '2'
  showTask: boolean; // 是否显示任务列
  showVideo: boolean; // 是否显示查看视频列
  showAnnotation: boolean; // 是否显示标注列
  showExport: boolean; // 是否显示导出报告列
  showBatchExport: boolean; // 是否显示批量导出按钮
  rowKey: 'pidcard' | 'videoId'; // 行的唯一标识
  identifierField: 'pidcard' | 'videoId'; // 用于删除和导出的字段
  apiFunction: (data: FormData) => Promise<any>; // 获取数据的API函数
  deleteFunction: (params: any) => Promise<any>; // 删除函数
  exportFunction: (params: any) => Promise<any>; // 导出函数
  getExportFileName: (record: RowData) => string; // 获取导出文件名
}

// 筛选条件类型
interface FilterData {
  gender: string | null;
  startTime: string | null;
  endTime: string | null;
  startAge: string | null;
  endAge: string | null;
  companyCode: string | null;
  companyName: string | null;
  testNumbers: string[];
}

// localStorage存储结构
interface StoredData {
  timestamp: number;
  data: FilterData;
}

// ---------------------- Props ----------------------
interface Props {
  config: TableConfig;
}

const props = defineProps<Props>();

// ---------------------- 响应式状态 ----------------------
const tableData = ref<RowData[]>([]);
const tableLoading = ref<boolean>(false);
const exportLoading = ref<boolean>(false);
const deleteLoading = ref<boolean>(false);
const isCollectAccount = ref<boolean>(false);
const selectedRowKeys = ref<string[]>([]);
const checkAllFlag = ref<boolean>(false);
const router = useRouter();

// ---------------------- 动态列配置 ----------------------
const dynamicColumns = computed(() => {
  const cols: any[] = [
    {
      title: '序号',
      key: 'index',
      align: 'center',
      width: 80,
      customRender: ({ index }: { index: number }) => index + 1,
    },
    {
      title: '姓名',
      dataIndex: 'pname',
      key: 'pname',
      align: 'center',
    },
    {
      title: '性别',
      dataIndex: 'pgender',
      key: 'pgender',
      align: 'center',
    },
    {
      title: '编号',
      dataIndex: 'pidcard',
      key: 'pidcard',
      align: 'center',
    },
    {
      title: '部别',
      dataIndex: 'ppositionName',
      key: 'ppositionName',
      align: 'center',
    },
  ];

  // 任务列
  if (props.config.showTask) {
    cols.push({
      title: '任务',
      dataIndex: 'testNumberName',
      key: 'testNumberName',
      align: 'center',
    });
  }

  // 测试时间
  cols.push({
    title: '测试时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
  });

      // 查看视频列
      if (props.config.showVideo) {
        cols.push({
          title: '查看视频',
          key: 'video',
          align: 'center',
          customRender: ({ record }: { record: RowData }) => {
            const videoRecord = record as VideoRowData;
            const videoBtn = h(
              'a',
              {
                style: {
                  color: isCollectAccount.value ? '#999' : '#d7d717',
                  textDecoration: 'underline',
                  cursor: isCollectAccount.value ? 'not-allowed' : 'pointer',
                  pointerEvents: isCollectAccount.value ? 'none' : 'auto'
                },
                onClick: () => {
                  if (!isCollectAccount.value) {
                    // 使用路由路径而不是name，因为HTML中使用的是路径
                    router.push({
                      path: '/emotion/emotionResult/checkVideoForm',
                      query: { videoId: videoRecord.videoId }
                    });
                  }
                },
                class: 'addTabPage'
              },
              '查看'
            );
            return h('div', [videoBtn]);
          },
        });
      }

  // 标注列
  if (props.config.showAnnotation) {
    cols.push({
      title: '标注',
      key: 'annotation',
      align: 'center',
      customRender: ({ record }: { record: RowData }) => {
        const videoRecord = record as VideoRowData;
        const annotationText = videoRecord.annotation ? '已标注' : '未标注';
        const annotationBtn = h(
          'span',
          {
            style: 'color: #FFFFFF; cursor: pointer;',
            title: videoRecord.annotation || '',
            onMouseenter: (e: MouseEvent) => {
              if (videoRecord.annotation) {
                // 可以添加tooltip显示完整标注内容
              }
            }
          },
          annotationText
        );
        return h('div', [annotationBtn]);
      },
    });
  }

  // 操作列
  cols.push({
    title: '操作',
    key: 'operation',
    align: 'center',
    width: 200,
    customRender: ({ record }: { record: RowData }) => {
      // 详情按钮
      const hasDetail = props.config.identifierField === 'pidcard' || 
                       (props.config.identifierField === 'videoId' && props.config.pageType !== 'invalidVideo');
      
      const detailBtn = hasDetail ? h('a', {
        style: {
          color: isCollectAccount.value ? '#999' : '#00f2ff',
          marginRight: '16px',
          textDecoration: 'underline',
          cursor: isCollectAccount.value ? 'not-allowed' : 'pointer',
          pointerEvents: isCollectAccount.value ? 'none' : 'auto'
        },
        onClick: () => {
          if (!isCollectAccount.value) {
            router.push({
              name: 'Emotionxiangqing',
              query: {
                pidcard: record.pidcard,
                pname: record.pname,
                pgender: record.pgender,
                ppositionName: record.ppositionName,
                age: record.age.toString(),
                sid: record.sid
              }
            });
          }
        },
        class: 'addTabPage'
      }, '详情') : null;

      // 删除按钮
      const deleteBtn = h('a', {
        style: {
          color: isCollectAccount.value ? '#999' : '#dd4b39',
          textDecoration: 'underline',
          cursor: isCollectAccount.value ? 'not-allowed' : 'pointer',
          pointerEvents: isCollectAccount.value ? 'none' : 'auto'
        },
        onClick: () => !isCollectAccount.value && handleSingleDelete(record)
      }, '删除');

      const buttons = detailBtn ? [detailBtn, deleteBtn] : [deleteBtn];
      return h('div', buttons);
    },
  });

  // 导出报告列
  if (props.config.showExport) {
    cols.push({
      title: '导出报告',
      key: 'export',
      align: 'center',
      customRender: ({ record }: { record: RowData }) => {
        const exportBtn = h(
          'a',
          {
            style: 'color: #00a45a; text-decoration: underline;',
            disabled: isCollectAccount.value,
            onClick: () => !isCollectAccount.value && handleSingleExport(record)
          },
          '导出报告'
        );
        return h('div', [exportBtn]);
      },
    });
  }

  return cols;
});

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys;
    checkAllFlag.value = keys.length > 0 && keys.length === tableData.value.length;
  },
}));

// ---------------------- 工具函数 ----------------------
const getRowClassName = (_: any, index: number) => {
  return index % 2 === 0 ? 'evenrowcolor' : 'oddrowcolor';
};

// ---------------------- 数据获取 ----------------------
const fetchTableData = async (filterData: FilterData) => {
  tableLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('type', props.config.type);

    // 处理基础参数：空值转null
    const baseParams: (keyof FilterData)[] = [
      'gender', 'startTime', 'endTime', 'startAge', 'endAge', 'companyCode', 'companyName'
    ];
    baseParams.forEach(key => {
      const value = filterData[key];
      const stringValue = value !== null && value !== undefined ? String(value) : 'null';
      formData.append(key, stringValue);
    });

    // 处理数组参数
    const testNumbersStr = filterData.testNumbers.length > 0 
      ? filterData.testNumbers.join(',') 
      : '';
    formData.append('testNumbers', testNumbersStr);

    // 使用配置的API函数获取数据
    const tableRes = await props.config.apiFunction(formData);
    tableData.value = (tableRes.data || tableRes || []) as RowData[];
  } catch (err) {
    message.error('表格数据加载失败');
  } finally {
    tableLoading.value = false;
  }
};

// ---------------------- 导出功能 ----------------------
const handleExport = async (record: RowData) => {
  try {
    const identifier = props.config.identifierField === 'pidcard' 
      ? (record as BaseRowData).pidcard 
      : (record as VideoRowData).videoId;
    
    const params = props.config.identifierField === 'pidcard'
      ? { pidcard: identifier }
      : { videoId: identifier };

    const res = await props.config.exportFunction(params);
    const blobData = res.data || res;
    const blob = new Blob([blobData], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = props.config.getExportFileName(record);
    link.click();
    message.success(`导出成功: ${record.pname}`);
  } catch (err) {
    message.error(`导出失败: ${err}`);
  }
};

// ---------------------- 事件处理 ----------------------
const handleCheckAll = () => {
  if (checkAllFlag.value) {
    selectedRowKeys.value = [];
  } else {
    selectedRowKeys.value = tableData.value.map(item => 
      props.config.rowKey === 'pidcard' 
        ? (item as BaseRowData).pidcard 
        : (item as VideoRowData).videoId
    );
  }
  checkAllFlag.value = !checkAllFlag.value;
};

const handleBatchExport = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.info('请选择要导出的记录');
    return;
  }

  exportLoading.value = true;
  try {
    const exportPromises = selectedRowKeys.value.map(key => {
      const record = tableData.value.find(item => {
        const identifier = props.config.rowKey === 'pidcard' 
          ? (item as BaseRowData).pidcard 
          : (item as VideoRowData).videoId;
        return identifier === key;
      });
      return record ? handleExport(record) : Promise.resolve();
    });
    await Promise.all(exportPromises);
    message.success('全部导出任务已发起');
  } catch (err) {
    message.error(`部分导出失败: ${err}`);
  } finally {
    exportLoading.value = false;
  }
};

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.info('请选择要删除的记录');
    return;
  }

  Modal.confirm({
    title: '确认要删除选中的人员信息吗？',
    icon: 'warning',
    onOk: async () => {
      deleteLoading.value = true;
      try {
        const deleteNext = async (index: number) => {
          if (index < selectedRowKeys.value.length) {
            const key = selectedRowKeys.value[index];
            const record = tableData.value.find(item => {
              const identifier = props.config.rowKey === 'pidcard' 
                ? (item as BaseRowData).pidcard 
                : (item as VideoRowData).videoId;
              return identifier === key;
            });
            try {
              const params = props.config.identifierField === 'pidcard'
                ? { pidcards: (record as BaseRowData).pidcard }
                : { videoIds: (record as VideoRowData).videoId };
              
              await props.config.deleteFunction(params);
              message.success(`成功删除${record?.pname}的人员信息!`);
            } catch (err) {
              message.error(`删除失败: ${record?.pname}`);
            } finally {
              await deleteNext(index + 1);
            }
          } else {
            // 重新请求数据
            const storedData = useStorage('key', '');
            let filterData: FilterData = {
              gender: null,
              startTime: null,
              endTime: null,
              startAge: null,
              endAge: null,
              companyCode: null,
              companyName: null,
              testNumbers: []
            };

            if (storedData.value) {
              const parsedData: StoredData = JSON.parse(storedData.value);
              const storedFilter = parsedData.data;
              filterData = {
                gender: storedFilter.gender ?? null,
                startTime: storedFilter.startTime ?? null,
                endTime: storedFilter.endTime ?? null,
                startAge: storedFilter.startAge ?? null,
                endAge: storedFilter.endAge ?? null,
                companyCode: storedFilter.companyCode ?? null,
                companyName: storedFilter.companyName ?? null,
                testNumbers: (() => {
                  const rawTest: any = storedFilter.testNumbers;
                  if (Array.isArray(rawTest) && rawTest.length > 0) {
                    return rawTest.filter((num: any) => typeof num === 'string' && num.trim() !== '');
                  } else if (typeof rawTest === 'string' && rawTest.trim() !== '') {
                    return rawTest.split(',').filter((num: string) => num.trim() !== '');
                  }
                  return [];
                })()
              };
            }
            await fetchTableData(filterData);
            selectedRowKeys.value = [];
            checkAllFlag.value = false;
          }
        };
        await deleteNext(0);
      } catch (err) {
        message.error('批量删除异常');
      } finally {
        deleteLoading.value = false;
      }
    },
  });
};

const handleSingleDelete = (record: RowData) => {
  Modal.confirm({
    title: `确认要删除${record.pname}的人员信息吗？`,
    content: '此操作不可撤销',
    icon: 'warning',
    onOk: async () => {
      try {
        const params = props.config.identifierField === 'pidcard'
          ? { pidcards: (record as BaseRowData).pidcard }
          : { videoIds: (record as VideoRowData).videoId };
        
        await props.config.deleteFunction(params);
        message.success(`成功删除${record.pname}的人员信息!`);
        
        // 重新请求数据
        const storedData = useStorage('key', '');
        let filterData: FilterData = {
          gender: null,
          startTime: null,
          endTime: null,
          startAge: null,
          endAge: null,
          companyCode: null,
          companyName: null,
          testNumbers: []
        };

        if (storedData.value) {
          const parsedData: StoredData = JSON.parse(storedData.value);
          const storedFilter = parsedData.data;
          filterData = {
            gender: storedFilter.gender ?? null,
            startTime: storedFilter.startTime ?? null,
            endTime: storedFilter.endTime ?? null,
            startAge: storedFilter.startAge ?? null,
            endAge: storedFilter.endAge ?? null,
            companyCode: storedFilter.companyCode ?? null,
            companyName: storedFilter.companyName ?? null,
            testNumbers: (() => {
              const rawTest: any = storedFilter.testNumbers;
              if (Array.isArray(rawTest) && rawTest.length > 0) {
                return rawTest.filter((num: any) => typeof num === 'string' && num.trim() !== '');
              } else if (typeof rawTest === 'string' && rawTest.trim() !== '') {
                return rawTest.split(',').filter((num: string) => num.trim() !== '');
              }
              return [];
            })()
          };
        }
        await fetchTableData(filterData);
      } catch (err) {
        message.error(`删除失败: ${err}`);
      }
    },
  });
};

const handleSingleExport = async (record: RowData) => {
  await handleExport(record);
};

// ---------------------- 生命周期 ----------------------
onMounted(async () => {
  // 解析localStorage
  const storedData = useStorage('key', '');
  let filterData: FilterData = {
    gender: null,
    startTime: null,
    endTime: null,
    startAge: null,
    endAge: null,
    companyCode: null,
    companyName: null,
    testNumbers: []
  };

  if (storedData.value) {
    try {
      const parsedData: StoredData = JSON.parse(storedData.value);
      const storedFilter = parsedData.data;
      filterData = {
        gender: null, // 页面首次加载时gender不恢复
        startTime: storedFilter.startTime ?? null,
        endTime: storedFilter.endTime ?? null,
        startAge: storedFilter.startAge ?? null,
        endAge: storedFilter.endAge ?? null,
        companyCode: storedFilter.companyCode ?? null,
        companyName: storedFilter.companyName ?? null,
        testNumbers: (() => {
          const rawTest: any = storedFilter.testNumbers;
          if (Array.isArray(rawTest) && rawTest.length > 0) {
            return rawTest.filter((num: any) => typeof num === 'string' && num.trim() !== '');
          } else if (typeof rawTest === 'string' && rawTest.trim() !== '') {
            return rawTest.split(',').filter((num: string) => num.trim() !== '');
          }
          return [];
        })()
      };
    } catch (parseErr) {
      message.warning('localStorage数据格式异常，使用默认筛选条件');
    }
  }

  // 判断账号类型
  try {
    const accountRes = await judgmentAccount();
    const accountType = accountRes.data || accountRes;
    isCollectAccount.value = accountType === '采集账号';
  } catch (err) {
    message.error('账号类型判断失败');
  }

  // 请求表格数据
  await fetchTableData(filterData);
});
</script>

<style scoped>
/* 样式与zongrenshu.vue保持一致 */
.emotion-result-page {
  height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  background: url('/js/static/image/win2.jpg') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
}

.content {
  height: 100%;
  width: 98%;
  margin: 0 auto;
  padding-top: 3px;
}

.manage-container {
  position: relative;
  height: 6vh;
  width: 100%;
}

.logo-img {
  display: flex;
  float: left;
  width: 50%;
  height: auto;
}

.batch-btn {
  float: right;
  margin: 5px;
  border-radius: 10px;
  border: 0;
  color: white;
  cursor: pointer;
  font-size: 18px;
  height: 100%;
  width: auto;
  padding: 0 20px;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}

/* 全选按钮 */
.batch-btn:first-of-type {
  background-color: #fa9700;
  margin-right: 4vh;
}

/* 批量导出按钮 */
.batch-export-btn {
  background-color: #00a55a;
}

/* 批量删除按钮 */
.batch-delete-btn {
  background-color: #dd4b39;
}

.batch-btn:active:not(.disabled) {
  transform: translateY(2px);
}

.batch-btn.disabled {
  background-color: #fff !important;
  color: #999 !important;
  cursor: not-allowed !important;
}

.table-box {
  width: 100%;
  margin: 1vh auto 0;
  color: #ffffff;
  font-size: 11px;
  border: 0;
  background: transparent;
}

:deep(.ant-table-thead > tr > th) {
  font-size: 23px;
  box-shadow: inset 0 0 10px #4487d5;
  border-radius: 50px !important;
  border: 0 !important;
  text-align: center;
  background: transparent !important;
  color: #ffffff !important;
  padding: 10px 16px;
}

:deep(.ant-table-tbody > tr > td) {
  border: 0 !important;
  font-size: 16px;
  color: #ffffff;
  padding: 10px 16px;
  background: transparent !important;
}

:deep(.ant-table-tbody > tr.evenrowcolor) {
  background-color: transparent !important;
  height: 5vh;
}

:deep(.ant-table-tbody > tr.oddrowcolor) {
  box-shadow: inset 0px 0px 13px #4487d5;
  height: 5vh;
  border-radius: 24px;
  border: 0;
  background: transparent !important;
}

:deep(.ant-table) {
  background: transparent !important;
}

:deep(.ant-table-container) {
  background: transparent !important;
}

:deep(.ant-table-body) {
  background: transparent !important;
}

:deep(.ant-spin-container) {
  background: transparent !important;
}

:deep(.ant-checkbox-wrapper) {
  color: #ffffff;
}

:deep(.ant-checkbox-inner) {
  background-color: transparent;
  border-color: #666;
}

:deep(.ant-checkbox-checked .ant-checkbox-inner) {
  background-color: #fa9700;
  border-color: #fa9700;
}

:deep(.addTabPage) {
  color: #00f2ff !important;
  text-decoration: underline;
  cursor: pointer;
}

:deep(.addTabPage:hover) {
  color: #00d4ff !important;
}
</style>

