import { defHttp } from '@jeesite/core/utils/http/axios';
import { useGlobSetting } from '@jeesite/core/hooks/setting';

const { adminPath } = useGlobSetting();

// 定义基础响应类型
interface BasicResult {
  code: number;
  message: string;
  data?: any;
  success: boolean;
}

// 人员信息接口
export interface PersonInfo {
  sid: string;
  pidcard: string;
  pname: string;
  pgender: string;
  pposition: string;
  ppositionName: string;
  modelingStatus: number; // 0-未建模 1-建模完成 2-建模中
  normalCount?: number;
  attentionCount?: number;
  emphasisAttentionCount?: number;
  age?: number;
}

// 查询参数
export interface PersonQueryParams {
  pidcard?: string;
  pname?: string;
  pgender?: string;
  pposition?: string;
  ppositionName?: string;
  pageNo?: number;
  pageSize?: number;
  orderBy?: string;
}

// 分页结果
export interface PersonPageResult {
  total: number;
  list: PersonInfo[];
}

// 查询人员列表
export const getPersonList = (params: PersonQueryParams) => {
  return defHttp.post<PersonPageResult>({
    url: adminPath + '/subject/subjectInformation/listData1',
    params,
  });
};

// 删除人员
export const deletePerson = (pidcards: string) => {
  return defHttp.post<BasicResult>({
    url: adminPath + '/emotion/emotionResult/deleteSubjectInformation',
    data: { pidcards },
  });
};

// 个人建模
export const requestIndividualModeling = (pidcards: string) => {
  return defHttp.post<BasicResult>({
    url:adminPath + '/subject/subjectInformation/requestIndividualModeling',
    params: { pidcards },
  });
};

// 更新人员部别
export const updatePositionAndName = (pidCard: string, pPosition: string, pPositionName: string) => {
  return defHttp.post<BasicResult>({
    url:adminPath + '/subject/subjectInformation/updatePositionAndName',
    params: { pidCard, pPosition, pPositionName },
  });
};

// 获取人员统计信息
export const getPersonStatistics = (pidcard: string) => {
  return defHttp.post({
    url:adminPath + '/subject/subjectInformation/findPersonInformation',
    params: { pidcard },
  });
};

// 导出人员报告
export const exportPersonReport = (pidCard: string) => {
  return defHttp.post({
    url: adminPath +'/subject/pdfExport/exportPdfFile',
    params: { pidCard },
    responseType: 'blob',
  });
};

// 导出数据库
export const exportDatabase = (path: string) => {
  return defHttp.post({
    url: adminPath +'/subject/resultExport/exportDatabaseData',
    params: { path },
  });
};

// 导入文件
export const importFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return defHttp.post({
    url: adminPath +'/face/faceInformation/insertFile',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 批量操作
export const batchOperation = (params: {
  type: 'modeling' | 'export' | 'delete';
  pidcards: string[];
}) => {
  return defHttp.post({
    url: adminPath +`/subject/subjectInformation/batch${params.type.charAt(0).toUpperCase() + params.type.slice(1)}`,
    data: { pidcards: params.pidcards },
  });
};