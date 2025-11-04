import request from '@jeesite/core/utils/request';

// 获取任务列表
export function getTaskList(pidCard: string) {
  return request({
    url: `/a/test/testNumber/findTestNumbersByPidCard?pidCard=${pidCard}`,
    method: 'get',
  });
}

// 获取个人数据 (根据HTML逻辑,使用URL参数)
export function getPersonalData(
  pidcard: string, 
  params?: {
    testNumber?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }
) {
  let url = `/a/emotion/emotionResult/findPerson?pidcard=${pidcard}`;
  if (params) {
    // testNumber: 即使为空字符串或null，也要添加到URL中（对应HTML行1166）
    if (params.testNumber !== undefined) {
      url += `&testNumber=${params.testNumber || ''}`;
    } else {
      url += `&testNumber=`;
    }
    // startDate: 如果为null或undefined，添加null
    if (params.startDate !== null && params.startDate !== undefined && params.startDate !== 'null') {
      url += `&startDate=${params.startDate}`;
    } else {
      url += `&startDate=null`;
    }
    // endDate: 如果为null或undefined，添加null
    if (params.endDate !== null && params.endDate !== undefined && params.endDate !== 'null') {
      url += `&endDate=${params.endDate}`;
    } else {
      url += `&endDate=null`;
    }
  } else {
    // 如果没有params，也要添加默认参数（对应HTML逻辑）
    url += `&testNumber=&startDate=null&endDate=null`;
  }
  return request({
    url,
    method: 'post',
  });
}

// 获取群体建模范围
export function getGroupRange() {
  return request({
    url: '/a/emotion/emotionParam/findIndicators',
    method: 'post',
  });
}

// 获取跟踪数据
export function getTrackingData(pidcard: string) {
  return request({
    url: `/a/emotion/emotionResult/findTrackingByPidcard?pidcard=${pidcard}`,
    method: 'post',
  });
}

// 获取个体建模范围
export function getSelfRange(pidcard: string) {
  return request({
    url: `/a/subject/subjectInformation/findPerson?pidcard=${pidcard}`,
    method: 'post',
  });
}

// 获取个人心理测评值
export function getMentalStateByPidcard(pidcard: string) {
  return request({
    url: `/a/emotion/emotionResult/findMentalStateByPidcard?pidcard=${pidcard}`,
    method: 'post',
  });
}

// 获取指标说明和建议
export function getSuggestionText(result: number) {
  return request({
    url: `/a/subject/pdfExport/getSuggestionText?result=${result}`,
    method: 'get',
  });
}

export function getSuggestionText2(result: number) {
  return request({
    url: `/a/subject/pdfExport/getSuggestionText2?result=${result}`,
    method: 'get',
  });
}

export function getSuggestionText3(result: number) {
  return request({
    url: `/a/subject/pdfExport/getSuggestionText3?result=${result}`,
    method: 'get',
  });
}

// 生成雷达图
export function generateRadarImage(min: number, max: number, result: number) {
  // 使用查询参数格式：min=55&max=70&result=65，而不是POST body
  return request({
    url: `/a/subject/pdfExport/fenweitu?min=${min}&max=${max}&result=${result}`,
    method: 'post',
  });
}

// 导出PDF
export function exportPdf(videoId: string) {
  return request({
    url: `/a/subject/pdfExport/exportPdfFile?videoId=${videoId}`,
    method: 'post',
    responseType: 'blob',
  });
}