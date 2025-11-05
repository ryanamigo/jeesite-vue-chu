import request from '@jeesite/core/utils/request';

// 获取关注人员列表
export function findFollowedInformation() {
  return request({
    url: '/a/emotion/emotionResult/findFollowedInformation',
    method: 'post',
  });
}


// 获取近15天心理状态统计
export function countNumberByPsychology() {
  return request({
    url: '/a/emotion/emotionResult/countNumberByPsychology',
    method: 'get',
  });
}

// 获取总人数
export function findAllPeopleCount(time: number) {
  return request({
    url: '/a/emotion/emotionResult/findAllPeopleCount',
    method: 'get',
    params: { time },
  });
}

// 获取总次数
export function findAllMidCount(time: number) {
  return request({
    url: '/a/emotion/emotionResult/findAllMidCount',
    method: 'get',
    params: { time },
  });
}

// 根据类型获取标注人数（回访人数/建模人数）
export function findAnnotationByType(type: number, time: number) {
  return request({
    url: '/a/subject/subjectInformation/findAnnotationByType',
    method: 'get',
    params: { type, time },
  });
}

// 根据类型获取建模人数
export function findModelingByType(type: number, time: number) {
  return request({
    url: '/a/subject/subjectInformation/findModelingByType',
    method: 'get',
    params: { type, time },
  });
}

// 获取测试次数统计
export function countTestNumber(time: number) {
  return request({
    url: '/a/emotion/emotionResult/countTestNumber',
    method: 'get',
    params: { time },
  });
}

// 获取近12月测试统计
export function findTwelveTestingInformation(time: number) {
  return request({
    url: '/a/emotion/emotionResult/findTwelveTestingInformation',
    method: 'get',
    params: { time },
  });
}

// 获取部门统计
export function countPosition(time: number) {
  return request({
    url: '/a/emotion/emotionResult/countPosition',
    method: 'get',
    params: { time },
  });
}

// 获取各类状态分布比例（8个指标）
export function findEmotionResultByEightIndicators(time: number) {
  return request({
    url: '/a/emotion/emotionResult/findEmotionResultByEightIndicators',
    method: 'get',
    params: { time },
  });
}

// 获取年龄比例
export function getPsychologyGroupByAge(time: number) {
  return request({
    url: '/a/emotion/emotionResult/getPsychologyGroupByAge',
    method: 'get',
    params: { time },
  });
}

// 获取任务完成情况统计
export function countTest(time: number) {
  return request({
    url: '/a/emotion/emotionResult/countTest',
    method: 'get',
    params: { time },
  });
}

