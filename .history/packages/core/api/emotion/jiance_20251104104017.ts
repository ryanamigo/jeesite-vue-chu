import request from '@jeesite/core/utils/request'; 
// 账号类型判断返回值类型
export type AccountType = '采集账号' | '管理账号' | string;

// 删除接口参数类型
export interface DeleteSubjectParams {
  pidcards: string; // 单个或多个pidcard（多个用逗号分隔）
}

// 导出报告参数类型
export interface ExportExcelParams {
  pidcard: string;
}

/**
 * 判断账号类型（采集账号/管理账号）
 * @returns 账号类型字符串
 */
export function judgmentAccount() {
  return request({
    url: '/a/judgmentAccount', 
    method: 'post',
  });
}

/**
 * 获取人员信息列表
 * @param data - 筛选条件FormData
 * @returns 人员信息数组
 */
export function getSubjectList(data: FormData) {
  return request({
    url: '/a/subject/subjectInformation/findInfomByType', 
    method: 'post',
    data, 
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 删除人员信息
 * @param params - 包含pidcards的参数对象
 * @returns 后端响应结果
 */
export function deleteSubject(params: DeleteSubjectParams) {
  return request({
    url: '/a/emotion/emotionResult/deleteSubjectInformation', // 补充/a/前缀
    method: 'post',
    data: params, // 对齐你现有接口用data传参的风格
  });
}

/**
 * 导出报告Excel
 * @param params - 包含pidcard的参数对象
 * @returns 二进制文件流（blob）
 */
export function exportExcel(params: ExportExcelParams) {
  return request({
    url: '/a/subject/resultExport/pidcardExportExcel', // 补充/a/前缀
    method: 'get',
    params, // get请求参数放在params中
    responseType: 'blob', // 关键：指定响应类型为blob
  });
}

// 删除视频相关信息参数类型
export interface DeleteVideoParams {
  videoIds: string; // 单个或多个videoId（多个用逗号分隔）
}

// 导出PDF报告参数类型
export interface ExportPdfParams {
  videoId: string;
}

/**
 * 获取检测次数详细列表（带任务信息）
 * @param data - 筛选条件FormData
 * @returns 人员信息数组（包含videoId和testNumberName）
 */
export function getDetectionTimesList(data: FormData) {
  return request({
    url: '/a/subject/subjectInformation/findDetailedListOfDetectionTimesByType',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 获取无效视频信息列表
 * @param data - 筛选条件FormData
 * @returns 无效视频信息数组（包含videoId）
 */
export function getInvalidVideoList(data: FormData) {
  return request({
    url: '/a/emotion/emotionVideo/findInformationByInvalidVideo',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 删除视频相关信息
 * @param params - 包含videoIds的参数对象
 * @returns 后端响应结果
 */
export function deleteVideo(params: DeleteVideoParams) {
  return request({
    url: '/a/emotion/emotionVideo/deleteRelevantInformationByVideoId',
    method: 'post',
    data: params,
  });
}

/**
 * 导出PDF报告
 * @param params - 包含videoId的参数对象
 * @returns 二进制文件流（blob）
 */
export function exportPdf(params: ExportPdfParams) {
  return request({
    url: '/a/subject/pdfExport/exportPdfFile',
    method: 'get',
    params,
    responseType: 'blob',
  });
}