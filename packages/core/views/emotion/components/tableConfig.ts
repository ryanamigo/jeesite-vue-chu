import type { TableConfig } from './SubjectListTable.vue';
import { 
  getSubjectList, 
  getDetectionTimesList, 
  getInvalidVideoList,
  deleteSubject,
  deleteVideo,
  exportExcel,
  exportPdf
} from '@jeesite/core/api/emotion/jiance';
import type { RowData } from './SubjectListTable.vue';

/**
 * 创建总人数页面配置
 */
export function createTotalPersonConfig(): TableConfig {
  return {
    pageType: 'totalPerson',
    type: '2',
    showTask: false,
    showVideo: false,
    showAnnotation: false,
    showExport: true,
    showBatchExport: true,
    rowKey: 'pidcard',
    identifierField: 'pidcard',
    apiFunction: getSubjectList,
    deleteFunction: deleteSubject,
    exportFunction: exportExcel,
    getExportFileName: (record: RowData) => {
      const baseRecord = record as any;
      return `${baseRecord.pidcard}-${baseRecord.pname}-导出报告.xlsx`;
    },
  };
}

/**
 * 创建今日检测人数页面配置
 */
export function createTodayPersonConfig(): TableConfig {
  return {
    pageType: 'todayPerson',
    type: '0',
    showTask: false,
    showVideo: false,
    showAnnotation: false,
    showExport: true,
    showBatchExport: true,
    rowKey: 'pidcard',
    identifierField: 'pidcard',
    apiFunction: getSubjectList,
    deleteFunction: deleteSubject,
    exportFunction: exportExcel,
    getExportFileName: (record: RowData) => {
      const baseRecord = record as any;
      return `${baseRecord.pidcard}-${baseRecord.pname}-导出报告.xlsx`;
    },
  };
}

/**
 * 创建总次数页面配置
 */
export function createTotalTimesConfig(): TableConfig {
  return {
    pageType: 'totalTimes',
    type: '2',
    showTask: true,
    showVideo: true,
    showAnnotation: true,
    showExport: true,
    showBatchExport: true,
    rowKey: 'videoId',
    identifierField: 'videoId',
    apiFunction: getDetectionTimesList,
    deleteFunction: deleteVideo,
    exportFunction: exportPdf,
    getExportFileName: (record: RowData) => {
      const videoRecord = record as any;
      return `${videoRecord.pidcard}-${videoRecord.pname}-${videoRecord.testNumberName}-导出报告.xlsx`;
    },
  };
}

/**
 * 创建今日检测次数页面配置
 */
export function createTodayTimesConfig(): TableConfig {
  return {
    pageType: 'todayTimes',
    type: '0',
    showTask: true,
    showVideo: true,
    showAnnotation: true,
    showExport: true,
    showBatchExport: true,
    rowKey: 'videoId',
    identifierField: 'videoId',
    apiFunction: getDetectionTimesList,
    deleteFunction: deleteVideo,
    exportFunction: exportPdf,
    getExportFileName: (record: RowData) => {
      const videoRecord = record as any;
      return `${videoRecord.pidcard}-${videoRecord.pname}-${videoRecord.testNumberName}-导出报告.xlsx`;
    },
  };
}

/**
 * 创建无效视频页面配置
 */
export function createInvalidVideoConfig(): TableConfig {
  return {
    pageType: 'invalidVideo',
    type: '0',
    showTask: true,
    showVideo: true,
    showAnnotation: false,
    showExport: false,
    showBatchExport: false,
    rowKey: 'videoId',
    identifierField: 'videoId',
    apiFunction: getInvalidVideoList,
    deleteFunction: deleteVideo,
    exportFunction: exportPdf, // 虽然不显示导出列，但保留函数定义
    getExportFileName: (record: RowData) => {
      const videoRecord = record as any;
      return `${videoRecord.videoId}-${videoRecord.pname}-导出报告.xlsx`;
    },
  };
}

