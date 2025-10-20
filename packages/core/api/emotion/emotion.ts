import request from '@jeesite/core/utils/request'; // 引入Jeesite封装的axios实例

// 判断账号类型（管理员/部门账号）
export function judgmentAccount() {
  return request({
    url: '/a/judgmentAccount',
    method: 'post',
  });
}

//  获取任务列表
export function getTaskList() {
  return request({
    url: '/a/test/testNumber/findTestNumberByLimit',
    method: 'post',
  });
}

// 获取左侧图表数据（综合心理排序）
export function getLeftChartData(params) {
  return request({
    url: `/a/emotion/emotionResult/findEmotionResultNumberByLevel?companyCode=${params.companyCode}&companyName=${params.companyName}`,
    method: 'post',
    data: params.formData,
  });
}

// 获取右侧图表数据（建模跟踪排序）
export function getRightChartData(params) {
  return request({
    url: `/a/emotion/emotionResult/findNumberOfPeopleByTracking?companyCode=${params.companyCode}&companyName=${params.companyName}`,
    method: 'post',
    data: params.formData,
  });
}

// 5. 获取顶部统计数据
export function getTopStatistics(params) {
  return {
    // 总人数
    headcount: request({
      url: `/a/subject/subjectInformation/findInfoNumberByType?companyCode=${params.companyCode}&companyName=${params.companyName}&type=2`,
      method: 'post',
      data: params.formData,
    }),
    // 总次数
    totalTimes: request({
      url: `/a/emotion/emotionResult/findAllCount?companyCode=${params.companyCode}&companyName=${params.companyName}&type=2`,
      method: 'post',
      data: params.formData,
    }),
    // 今日检测人数
    headcountToday: request({
      url: `/a/subject/subjectInformation/findInfoNumberByType?companyCode=${params.companyCode}&companyName=${params.companyName}&type=0`,
      method: 'post',
      data: params.formData,
    }),
    // 今日检测次数
    totalTimesToday: request({
      url: `/a/emotion/emotionResult/findAllCount?companyCode=${params.companyCode}&companyName=${params.companyName}&type=0`,
      method: 'post',
      data: params.formData,
    }),
    // 无效视频数据
    ineffectiveVideo: request({
      url: `/a/emotion/emotionVideo/getTheNumberOfInvalidVideos?companyCode=${params.companyCode}&companyName=${params.companyName}`,
      method: 'post',
      data: params.formData,
    }),
  };
}
