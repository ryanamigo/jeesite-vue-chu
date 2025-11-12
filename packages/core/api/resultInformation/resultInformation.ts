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

// 任务批次信息接口
export interface TestNumberInfo {
  testNumber: string;
  testNumberName: string;
}

// 任务管理查询参数
export interface ResultInformationQueryParams {
  pidcard?: string;
  pname?: string;
  pgender?: string;
  pposition?: string;
  ppositionName?: string;
  ppositionNameCode?: string;
  testNumber?: string;
  testNumberName?: string;
  alarmStatus?: string;
  psychologyStatus?: string;
  pageNo?: number;
  pageSize?: number;
  orderBy?: string;
}

// 任务管理列表项
export interface ResultInformationItem {
  mid: string;
  pidcard: string;
  pname: string;
  age: number;
  pgender: string;
  ppositionName: string;
  alarmStatus: number; // 0-未跟踪 1-正常 2-一般 3-关注
  psychologyStatus: number; // 0-正常 1-一般 2-关注
  testNumber: string;
  testNumberName: string;
  annotation?: string;
  annotationType?: number;
  videoId: string;
}

// 分页结果
export interface ResultInformationPageResult {
  total: number;
  list: ResultInformationItem[];
}

// 查询任务批次列表
export const getTestNumberList = () => {
  return defHttp.post<TestNumberInfo[]>({
    url: adminPath + '/test/testNumber/findTestNumberByLimit',
  });
};

// 根据任务批次查询部门列表
export const getCompanyByTestNumber = (testNumber: string) => {
  return defHttp.post({
    url: adminPath + '/test/testNumber/findCompanyByTestNUmber',
    params: { testNumber },
  });
};

// 新增任务批次
export const insertTestNumberInformation = (params: {
  testNumberName: string;
  department: string;
  departmentsName: string;
}) => {
  return defHttp.post<BasicResult>({
    url: adminPath + '/test/testNumber/insertTestNumberInformation',
    params,
  });
};

// 删除任务批次
export const deleteTestNumber = (testNumber: string) => {
  return defHttp.post<BasicResult>({
    url: adminPath + '/subject/subjectInformation/deleteByTestNumber',
    data: { testNumber },
  });
};

// 查询任务管理列表
export const getResultInformationList = (params: ResultInformationQueryParams) => {
  return defHttp.post<ResultInformationPageResult>({
    url: adminPath + '/result/resultInformation/listData1',
    params,
  });
};

// 删除个人结果
export const deleteEmotionResultByVideoId = (videoIds: string) => {
  return defHttp.post<BasicResult>({
    url: adminPath + '/emotion/emotionResult/deleteEmotionResultByVideoId',
    data: { videoIds },
  });
};

// 删除相关信息（通过videoId）
export const deleteRelevantInformationByVideoId = (videoIds: string) => {
  return defHttp.post<BasicResult>({
    url: adminPath + '/emotion/emotionVideo/deleteRelevantInformationByVideoId',
    data: { videoIds },
  });
};

// 更新标注信息
export const updateAnnotationInfo = (params: {
  pidCard: string;
  annotation: string;
  annotationType: number;
}) => {
  return defHttp.post<BasicResult>({
    url: adminPath + '/subject/subjectInformation/updateAnnotationInfo',
    params,
  });
};

// 导出PDF报告
export const exportPdfFile = (videoId: string) => {
  return defHttp.post({
    url: adminPath + '/subject/pdfExport/exportPdfFile',
    params: { videoId },
    responseType: 'blob',
  }, {
    isReturnNativeResponse: true,
  });
};

// 导出整体报告
export const exportAllPdf = (testNumber: string) => {
  return defHttp.get({
    url: adminPath + '/subject/allPdfExport/allExportPDF',
    params: { testNumber },
    responseType: 'blob',
  }, {
    isReturnNativeResponse: true,
  });
};

// 导出Excel表格
export const exportTaskExcel = (testNumber: string) => {
  return defHttp.get({
    url: adminPath + '/subject/resultExport/taskExportExcel',
    params: { testNumber },
    responseType: 'blob',
  }, {
    isReturnNativeResponse: true,
  });
};

// 查询未检测人员
export const findListOfUntestedPersonnel = (testnumber: string) => {
  return defHttp.post({
    url: adminPath + '/emotion/emotionVideo/findListOfUntestedPersonnel',
    params: { testnumber },
  });
};

// 上传视频文件
export const updateOrInsertVideoByPidCard = (formData: FormData) => {
  return defHttp.post<BasicResult>({
    url: adminPath + '/emotion/emotionVideo/updateOrInsertVideoByPidCard',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

