<template>
  <div class="content" style="flex: 1; display: flex; flex-direction: column">
    <!-- 头部统计卡片区域 -->
    <div class="header">
      <!-- 总人数卡片 -->
      <DataStatCard 
        title="总人数" 
        :value="topStat.headcount || 0" 
        valueClass="headcount"
        :icon="iconHeadcount" 
        cardId="data_box1_headcount" 
        jumpTitle="总人数详情" 
        @cardClick="handleCardJump"
      />
      <div id="virtualBox1"></div>

      <!-- 总次数卡片 -->
      <DataStatCard 
        title="总次数" 
        :value="topStat.totalTimes || 0" 
        valueClass="totalTimes"
        :icon="iconTotalTimes" 
        cardId="data_box2_totalTimes" 
        jumpTitle="总次数详情" 
        @cardClick="handleCardJump"
      />
      <div id="virtualBox2"></div>

      <!-- 今日检测人数卡片 -->
      <DataStatCard 
        title="今日检测人数" 
        :value="topStat.headcountToday || 0" 
        valueClass="headcount_today"
        :icon="iconHeadcountToday" 
        cardId="data_box3_headcount_today" 
        jumpTitle="今日检测人数详情" 
        @cardClick="handleCardJump"
      />
      <div id="virtualBox3"></div>

      <!-- 今日检测次数卡片 -->
      <DataStatCard 
        title="今日检测次数" 
        :value="topStat.totalTimesToday || 0" 
        valueClass="totalTimes_today"
        :icon="iconTotalTimesToday" 
        cardId="data_box4_totalTimes_today" 
        jumpTitle="今日检测次数详情" 
        @cardClick="handleCardJump"
      />
      <div id="virtualBox4"></div>

      <!-- 无效视频数据卡片 -->
      <DataStatCard 
        title="无效视频数据" 
        :value="topStat.ineffectiveVideo || 0" 
        valueClass="ineffectiveVideo"
        :icon="iconIneffectiveVideo" 
        cardId="data_box5_ineffectiveVideo" 
        jumpTitle="无效视频数据详情" 
        @cardClick="handleCardJump"
      />
      <div id="virtualBox5"></div>
    </div>

    <!-- 筛选区域 -->
    <div class="middle" v-if="showFilterArea">
      <div style="border: 1px solid #a7babc;"></div>
      <div class="comprehensive_data">
        <div class="fl"><p>综合数据</p></div>
        <div class="fr">
          <!-- 时间筛选项 -->
          <div class="filter-item time-filter">
            <p class="filter-label">时间</p>
            <div class="layui-form">
              <div class="layui-form-item" style="display: inline-block;">
                <div class="layui-inline">
                  <div class="layui-inline" id="ID-laydate-range"
                    style="display: flex; align-items: center; justify-content: flex-start;">
                    <div class="layui-input-inline" style="flex: 1;">
                      <input type="text" autocomplete="off" v-model="filterParams.startTime" class="layui-input laydate" placeholder="开始日期" id="startTime" name="startTime" readonly>
                    </div>
                    <div class="layui-form-mid" style="color: #ffffff; flex: 0 0 auto;">-</div>
                    <div class="layui-input-inline" style="flex: 1;">
                      <input type="text" autocomplete="off" v-model="filterParams.endTime" class="layui-input laydate" placeholder="结束日期" id="endTime" name="endTime" readonly>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 部别筛选项 -->
          <div class="filter-item dept-filter">
            <p class="filter-label">部别</p>
            <TreeSelect
              v-model:value="filterParams.companyCode"
              v-model:labelValue="filterParams.companyName"
              :api="companyTreeData"
              :componentProps="{
                allowClear: true,
                canSelectRoot: true,
                canSelectParent: true,
                params: { ctrlPermi: 2 }
              }"
              style="width: 100%"
              placeholder="请选择部别"
            />
          </div>

          <!-- 任务筛选项 -->
          <div class="filter-item task-filter">
            <p class="filter-label">任务</p>
            <Select
              v-model:value="filterParams.testNumbers"
              :options="taskList"
              mode="multiple"
              placeholder="请选择任务"
              :allowClear="true"
              style="width: 100%"
            />
          </div>

          <!-- 性别筛选项 -->
          <div class="filter-item gender-filter">
            <p class="filter-label">性别</p>
            <select v-model="filterParams.gender" class="layui-select" id="gender" :class="{ 'placeholder-selected': !filterParams.gender }">
              <option value="">请选择性别</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>

          <!-- 年龄筛选项 -->
          <div class="filter-item age-filter">
            <p class="filter-label">年龄</p>
            <div class="age-range">
              <input type="number" v-model="filterParams.startAge" class="layui-input" placeholder="最小年龄" min="0" step="1" id="startAge">
              <span class="age-separator">-</span>
              <input type="number" v-model="filterParams.endAge" class="layui-input" placeholder="最大年龄" min="0" step="1" id="endAge">
            </div>
          </div>

          <!-- 按钮区域 -->
          <div class="filter-item btn-filter">
            <button class="layui-btn query-btn" @click="handleQuery">查询</button>
            <button class="layui-btn reset-btn" @click="handleReset">重置</button>
          </div>
        </div>
      </div>
      <div style="border: 1px solid #a7babc;"></div>
    </div>

    <!-- 图表区域 -->
    <div class="main_chart" v-if="showChartArea">
      <div class="legendContainer" style="flex: 0 0 5vh; height: 5vh;">
        <div class="legend-left">
          <label class="legend1">正常</label>
          <label class="legend2">一般</label>
          <label class="legend3">关注</label>
          <label class="legend4" style="margin-left: 80px;">综合心理排序</label>
        </div>
        <div class="legend-right">
          <label class="legend4" style="margin-right: 80px;">建模跟踪排序</label>
          <label class="legend3">关注</label>
          <label class="legend2">一般</label>
          <label class="legend1">正常</label>
        </div>
      </div>
      <div class="charts-container">
        <div class="chart_box">
          <canvas id="myChart1"></canvas>
        </div>
        <div class="chart_box">
          <canvas id="myChart2"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, markRaw, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from '@jeesite/core/hooks/web/useMessage';
import { useGo } from '@jeesite/core/hooks/web/usePage';
import { Select } from 'ant-design-vue';
import { TreeSelect } from '@jeesite/core/components/Form';
import { companyTreeData } from '@jeesite/core/api/sys/company';
import { 
  judgmentAccount, 
  getTopStatistics,
  getTaskList,
  getLeftChartData,
  getRightChartData
} from '@jeesite/core/api/emotion/emotion';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DataStatCard from './components/HeaderStatistics.vue';

// 导入图片资源
import iconHeadcount from '@jeesite/assets/images/emotion/总人数.png';
import iconTotalTimes from '@jeesite/assets/images/emotion/总次数.png';
import iconHeadcountToday from '@jeesite/assets/images/emotion/今日检测人数.png';
import iconTotalTimesToday from '@jeesite/assets/images/emotion/今日检测次数.png';
import iconIneffectiveVideo from '@jeesite/assets/images/emotion/无效视频.png';


const router = useRouter();
const { createMessage } = useMessage();
const go = useGo();

const topStat = ref({
  headcount: 0,
  totalTimes: 0,
  headcountToday: 0,
  totalTimesToday: 0,
  ineffectiveVideo: 0,
});
const filterParams = ref({
  startTime: '',
  endTime: '',
  companyCode: null,
  companyName: null,
  testNumbers: [],
  gender: '',
  startAge: null,
  endAge: null
});
const taskList = ref([]);
const showFilterArea = ref(true);
const showChartArea = ref(true);
const leftChart = ref(null);
const rightChart = ref(null);

const handleCardJump = (cardId, title) => {
  if (cardId === 'data_box1_headcount') {
    go({
      path: '/emotion/zongrenshu',
      query: { type: 'headcount' }
    }); 
  } 
  else if (cardId === 'data_box2_totalTimes') {
    go({
      path: '/emotion/zongcishu',
      query: { type: 'totalTimes' }
    }); 
  }
  else if (cardId === 'data_box3_headcount_today') {
    go({
      path: '/emotion/jinrijiance',
      query: { type: 'headcount_today' }
    }); 
  }
  else if (cardId === 'data_box4_totalTimes_today') {
    go({
      path: '/emotion/jiancecishu',
      query: { type: 'totalTimes_today' }
    }); 
  }
  else if (cardId === 'data_box5_ineffectiveVideo') {
    go({
      path: '/emotion/wuxiaoshipin',
      query: { type: 'ineffectiveVideo' }
    }); 
  }
};

// 保存筛选条件到 localStorage
const saveFilterToStorage = (filterData) => {
  const dataToStore = { ...filterData };
  
  // testNumbers处理：如果是数组且不为空，转换为逗号分隔的字符串；空数组保持空数组
  if (Array.isArray(dataToStore.testNumbers)) {
    dataToStore.testNumbers = dataToStore.testNumbers.length > 0 
      ? dataToStore.testNumbers.join(',') 
      : [];
  }
  
  const timestamp = new Date().getTime();
  const stored = localStorage.getItem('key');
  
  //先读取旧数据进行比较
  let previousData = null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      //尝试读取 parsed.data，如果没有则可能是旧格式（直接存储dataFiltered）
      previousData = parsed.data || (parsed.timestamp ? null : parsed); // 如果有timestamp说明是新格式，否则是旧格式
    } catch (error) {
      // 解析失败，视为没有旧数据
      previousData = null;
    }
  }
  
  // 比较当前数据和上一次存储的数据
  if (!previousData || JSON.stringify(dataToStore) !== JSON.stringify(previousData)) {
    // 数据不同或没有旧数据，则更新存储
    const storedData = {
      timestamp,
      data: dataToStore
    };
    localStorage.setItem('key', JSON.stringify(storedData));
    // 注意：HTML中这里会清空 aTags 和 aTags2 数组，但Vue中使用路由跳转，不需要此逻辑
  }
};

// 从 localStorage 恢复筛选条件
const restoreFilterFromStorage = () => {
  try {
    const stored = localStorage.getItem('key');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.data) {
        // 恢复筛选条件（按照HTML逻辑：空字符串或null都转为null，空数组保持空数组）
        // 注意：页面首次加载时，gender字段不恢复，使用默认值null
        filterParams.value = {
          startTime: parsed.data.startTime && parsed.data.startTime.trim() !== '' ? parsed.data.startTime : '',
          endTime: parsed.data.endTime && parsed.data.endTime.trim() !== '' ? parsed.data.endTime : '',
          companyCode: parsed.data.companyCode || null,
          companyName: parsed.data.companyName || null,
          testNumbers: (() => {
            const rawTest = parsed.data.testNumbers;
            if (Array.isArray(rawTest) && rawTest.length > 0) {
              return rawTest.filter(num => typeof num === 'string' && num.trim() !== '');
            } else if (typeof rawTest === 'string' && rawTest.trim() !== '') {
              return rawTest.split(',').filter(num => num.trim() !== '');
            }
            return [];
          })(),
          // 页面首次加载时，gender不恢复，保持默认值''（会转换为null）
          gender: '',
          startAge: parsed.data.startAge && parsed.data.startAge !== '' ? parsed.data.startAge : null,
          endAge: parsed.data.endAge && parsed.data.endAge !== '' ? parsed.data.endAge : null
        };
        return true;
      }
    }
  } catch (error) {
    console.error('恢复筛选条件失败：', error);
  }
  return false;
};

const getFilterParams = () => {
  // 返回符合原始 HTML 格式的筛选数据
  // 原HTML逻辑：dataFiltered[input.id] = input.id === 'testNumbers' && input.value.trim() === '' ? [] : input.value.trim() || null;
  // 原HTML逻辑：dataFiltered[select.id] = select.value.trim() || null;
  const params = { ...filterParams.value };
  
  // 处理各个字段，按照HTML逻辑：空字符串转为null，空数组保持空数组
  if (params.startTime === '' || params.startTime === null || params.startTime === undefined) {
    params.startTime = null;
  }
  if (params.endTime === '' || params.endTime === null || params.endTime === undefined) {
    params.endTime = null;
  }
  if (params.gender === '' || params.gender === null || params.gender === undefined) {
    params.gender = null;
  }
  if (params.startAge === '' || params.startAge === null || params.startAge === undefined) {
    params.startAge = null;
  }
  if (params.endAge === '' || params.endAge === null || params.endAge === undefined) {
    params.endAge = null;
  }
  if (!Array.isArray(params.testNumbers)) {
    params.testNumbers = params.testNumbers ? (Array.isArray(params.testNumbers) ? params.testNumbers : [params.testNumbers]) : [];
  }
  
  return params;
};

const handleQuery = async () => {
  const loading = window.$loading?.service({
    text: '正在查询数据...',
  });
  
  try {
    // 获取筛选参数（确保使用最新的筛选条件）
    const filterData = getFilterParams();
    console.log('查询筛选条件：', filterData);
    
    // 保存到 localStorage
    saveFilterToStorage(filterData);
    
    // 请求数据：上方五个统计卡片和下方两个图表
    // 使用 await 确保按顺序执行，并且使用最新的筛选条件
    await fetchTopStatistics();
    await fetchChartData();
    
    toast.success('查询成功');
  } catch (error) {
    const errorMsg = error?.message || error?.toString() || '未知错误';
    toast.error(`查询失败：${errorMsg}`);
    console.error('查询错误：', error);
  } finally {
    loading?.close();
  }
};

const handleReset = () => {
  // 重置所有筛选条件（按照HTML逻辑，空值使用空字符串或null）
  filterParams.value = {
    startTime: '',
    endTime: '',
    companyCode: null,
    companyName: null,
    testNumbers: [],
    gender: '',
    startAge: null,
    endAge: null
  };
  
  // 清空日期选择器的显示值
  nextTick(() => {
    const startTimeEl = document.getElementById('startTime');
    const endTimeEl = document.getElementById('endTime');
    if (startTimeEl) startTimeEl.value = '';
    if (endTimeEl) endTimeEl.value = '';
  });
  
  // 清空 localStorage
  localStorage.removeItem('key');
  
  // 执行查询（使用默认条件，原HTML中重置后也会调用submitBtnClick）
  handleQuery();
};

const buildFormData = () => {
  const fd = new FormData();
  const params = getFilterParams();
  
  // 按照原HTML代码的逻辑构建FormData
  // 原HTML: var gender = String(dataFiltered.gender);
  // 注意：如果dataFiltered.gender是null，String(null)会得到字符串"null"
  // 如果dataFiltered.gender是undefined，String(undefined)会得到字符串"undefined"
  // 为了确保null值被正确处理，使用params.gender ?? null，然后String转换
  const gender = String(params.gender ?? null);
  const startTime = String(params.startTime ?? null);
  const endTime = String(params.endTime ?? null);
  const startAge = String(params.startAge ?? null);
  const endAge = String(params.endAge ?? null);
  
  // testNumbers处理：原HTML逻辑
  // var testNumbers;
  // if (dataFiltered.testNumbers && dataFiltered.testNumbers.length === 0) {
  //   testNumbers = [];
  // } else {
  //   testNumbers = dataFiltered.testNumbers ? dataFiltered.testNumbers.split(',') : [];
  // }
  // formData2.append('testNumbers', testNumbers);
  // 注意：原HTML中testNumbers可能是逗号分隔的字符串，需要split成数组，但FormData.append数组时会被序列化
  // 但实际观察原代码，FormData.append('testNumbers', testNumbers)中的testNumbers是数组
  // 根据FormData的规范，append数组会将其序列化为字符串
  let testNumbers = [];
  if (params.testNumbers && params.testNumbers.length === 0) {
    testNumbers = [];
  } else if (params.testNumbers) {
    if (Array.isArray(params.testNumbers)) {
      testNumbers = params.testNumbers;
    } else if (typeof params.testNumbers === 'string' && params.testNumbers.trim() !== '') {
      testNumbers = params.testNumbers.split(',').filter(v => v.trim() !== '');
    }
  }
  
  // 追加到FormData（严格按照原HTML代码的方式）
  fd.append('gender', gender);
  fd.append('startTime', startTime);
  fd.append('endTime', endTime);
  fd.append('startAge', startAge);
  fd.append('endAge', endAge);
  // 原HTML中直接append数组，FormData会自动处理
  // 但为了确保兼容性，如果数组为空则append空字符串，否则append逗号分隔的字符串
  fd.append('testNumbers', Array.isArray(testNumbers) && testNumbers.length > 0 ? testNumbers.join(',') : '');
  
  return fd;
};

const fetchTopStatistics = async () => {
  console.log('开始请求顶部统计数据');
  const formData = buildFormData();
  
  // 按照原HTML代码的方式处理companyCode和companyName
  // 原HTML: var companyCode = String(dataFiltered.companyCode);
  // 注意：原HTML中即使是null也会被转换为字符串'null'
  const companyCode = filterParams.value.companyCode !== null && filterParams.value.companyCode !== undefined 
    ? String(filterParams.value.companyCode) 
    : 'null';
  const companyName = filterParams.value.companyName !== null && filterParams.value.companyName !== undefined 
    ? String(filterParams.value.companyName) 
    : 'null';
  
  const requestParams = {
    companyCode: companyCode,
    companyName: companyName,
    formData
  };

  const statRequests = getTopStatistics(requestParams);
  
  const [headcountRes, totalTimesRes, headcountTodayRes, totalTimesTodayRes, ineffectiveVideoRes] =
    await Promise.all([
      statRequests.headcount,
      statRequests.totalTimes,
      statRequests.headcountToday,
      statRequests.totalTimesToday,
      statRequests.ineffectiveVideo,
    ]);

  topStat.value = {
    headcount: headcountRes?.data || 0,
    totalTimes: totalTimesRes?.data || 0,
    headcountToday: headcountTodayRes?.data || 0,
    totalTimesToday: totalTimesTodayRes?.data || 0,
    ineffectiveVideo: ineffectiveVideoRes?.data || 0,
  };
};

const fetchTaskList = async () => {
  try {
    const res = await getTaskList();
    taskList.value = (res.data || res || []).map(task => ({
      label: task.testNumberName || task.name,
      value: task.testNumber || task.value
    }));
  } catch (error) {
    const errorMsg = error?.message || error?.toString() || '未知错误';
    toast.error(`任务列表加载失败：${errorMsg}`);
    console.error('任务列表加载错误：', error);
  }
};

Chart.register(ChartDataLabels);

// 动态加载 layui
const loadLayui = () => {
  return new Promise((resolve, reject) => {
    // 如果已经加载，直接返回
    if (window.layui && window.layui.laydate) {
      resolve(window.layui);
      return;
    }

    // 检查是否正在加载
    if (window.__layuiLoading) {
      const checkInterval = setInterval(() => {
        if (window.layui && window.layui.laydate) {
          clearInterval(checkInterval);
          resolve(window.layui);
        }
      }, 100);
      return;
    }

    // 加载 layui CSS
    if (!document.querySelector('link[href*="layui.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/js/static/css/layui.css';
      document.head.appendChild(link);
    }

    // 加载 layui JS
    if (!window.layui) {
      window.__layuiLoading = true;
      const script = document.createElement('script');
      script.src = '/js/static/js/layui.js';
      script.onload = () => {
        window.__layuiLoading = false;
        if (window.layui) {
          window.layui.use(['laydate'], function() {
            resolve(window.layui);
          });
        } else {
          reject(new Error('layui 加载失败'));
        }
      };
      script.onerror = () => {
        window.__layuiLoading = false;
        reject(new Error('layui 脚本加载失败'));
      };
      document.head.appendChild(script);
    } else if (window.layui) {
      window.layui.use(['laydate'], function() {
        resolve(window.layui);
      });
    }
  });
};

// 初始化日期选择器
const initDatePicker = async () => {
  // 等待DOM渲染完成
  await nextTick();
  
  try {
    // 确保 layui 已加载
    await loadLayui();
    
    // 再次等待 DOM 确保元素存在
    await nextTick();
    
    const startTimeEl = document.getElementById('startTime');
    const endTimeEl = document.getElementById('endTime');
    const rangeEl = document.getElementById('ID-laydate-range');
    
    if (!startTimeEl || !endTimeEl || !rangeEl) {
      console.warn('日期选择器元素未找到，延迟重试');
      setTimeout(() => initDatePicker(), 200);
      return;
    }

    if (window.layui && window.layui.laydate) {
      const laydate = window.layui.laydate;
      // 日期范围 - 左右面板独立选择模式（与HTML页面保持一致）
      laydate.render({
        elem: '#ID-laydate-range',
        theme: '#1e9fff',
        range: ['#startTime', '#endTime'],
        done: (value, date, endDate) => {
          // 当日期选择完成时，同步更新 v-model
          if (value) {
            const dates = value.split(' - ');
            if (dates.length === 2) {
              filterParams.value.startTime = dates[0];
              filterParams.value.endTime = dates[1];
            }
          } else {
            // 清空时也更新
            filterParams.value.startTime = '';
            filterParams.value.endTime = '';
          }
        }
      });
      console.log('日期选择器初始化成功');
    } else {
      console.error('layui.laydate 未找到');
    }
  } catch (error) {
    console.error('日期选择器初始化失败：', error);
    // 如果加载失败，延迟重试
    setTimeout(() => initDatePicker(), 500);
  }
};

const initCharts = () => {
  const ctx1 = document.getElementById('myChart1').getContext('2d');
  const chart1 = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['1级', '2级', '3级', '4级', '5级'],
      datasets: [
        {
          label: '正常',
          data: [0, 0, 0, 0, 0],
          backgroundColor: '#4CAF50',
          borderColor: '#4CAF50',
          borderWidth: 1,
          stack: 'overlap',
          barPercentage: 0.3,
        },
        {
          label: '关注',
          backgroundColor: '#c8c533',
          borderColor: '#c8c533',
          borderWidth: 1,
          data: [0, 0, 0, 0, 0],
          stack: 'overlap',
          barPercentage: 0.3,
        },
        {
          label: '重点关注',
          backgroundColor: '#f44336',
          borderColor: '#f44336',
          borderWidth: 1,
          data: [0, 0, 0, 0, 0],
          stack: 'overlap',
          barPercentage: 0.3,
        }
      ]
    },
    options: getChartOptions('left'),
    plugins: [ChartDataLabels]
  });
  // 使用 markRaw 防止 Chart.js 实例被响应式化
  leftChart.value = markRaw(chart1);

  const ctx2 = document.getElementById('myChart2').getContext('2d');
  const chart2 = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: ['1级', '2级', '3级', '4级', '5级'],
      datasets: [
        {
          label: '正常',
          data: [0, 0, 0, 0, 0],
          backgroundColor: '#4CAF50',
          borderColor: '#4CAF50',
          borderWidth: 1,
          stack: 'overlap',
          barPercentage: 0.3,
        },
        {
          label: '关注',
          backgroundColor: '#c8c533',
          borderColor: '#c8c533',
          borderWidth: 1,
          data: [0, 0, 0, 0, 0],
          stack: 'overlap',
          barPercentage: 0.3,
        },
        {
          label: '重点关注',
          backgroundColor: '#f44336',
          borderColor: '#f44336',
          borderWidth: 1,
          data: [0, 0, 0, 0, 0],
          stack: 'overlap',
          barPercentage: 0.3,
        }
      ]
    },
    options: getChartOptions('right'),
    plugins: [ChartDataLabels]
  });
  // 使用 markRaw 防止 Chart.js 实例被响应式化
  rightChart.value = markRaw(chart2);
};

const getChartOptions = (chartType = 'left') => {
  return {
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: function(context) {
          var value = context.dataset.data[context.dataIndex];
          return value > 0;
        },
        anchor: 'end',
        align: 'top',
        formatter: function(value) {
          return value;
        },
        color: 'white',
        font: {
          size: 12
        }
      },
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        display: true,
        ticks: {
          color: 'white',
          font: {
            size: 16
          }
        },
        border: {
          display: true,
          color: 'white'
        },
        grid: {
          display: false,
          borderColor: 'white'
        }
      },
      y: {
        display: true,
        ticks: {
          display: true,
          color: 'white',
          font: {
            size: 16
          }
        },
        border: {
          display: true,
          color: 'white'
        },
        grid: {
          display: false,
          borderColor: 'white'
        },
        min: 0
      }
    },
    onClick: function(event, elements) {
      const stringsArray = chartType === 'left' 
        ? ['myChart1_1', 'myChart1_2', 'myChart1_3', 'myChart1_4', 'myChart1_5']
        : ['myChart2_1', 'myChart2_2', 'myChart2_3', 'myChart2_4', 'myChart2_5'];
      
      if (elements.length > 0) {
        const index = elements[0].index;
        const routeName = stringsArray[index];
        
        // 构建标题
        const levelNames = chartType === 'left'
          ? ['1级(综合心理排序)列表详情', '2级(综合心理排序)列表详情', '3级(综合心理排序)列表详情', '4级(综合心理排序)列表详情', '5级(综合心理排序)列表详情']
          : ['1级(建模跟踪排序)列表详情', '2级(建模跟踪排序)列表详情', '3级(建模跟踪排序)列表详情', '4级(建模跟踪排序)列表详情', '5级(建模跟踪排序)列表详情'];
        
        const title = levelNames[index];
        
        // 根据不同的chart和级别跳转到对应的路由
        // 所有级别都跳转到zongrenshu页面，但可以通过query参数区分
        go({
          path: '/emotion/zongrenshu',
          query: {
            chartType: chartType,
            level: index + 1,
            routeName: routeName
          }
        });
      }
    }
  };
};

const updateChartData = async (chart, data) => {
  if (!chart) return;
  
  // 使用 toRaw 获取原始 chart 实例，避免响应式系统递归调用
  const rawChart = toRaw(chart);
  if (!rawChart) return;
  
  // 按照HTML代码的逻辑处理数据
  // 确保数据是非响应式的原生数组
  var data1 = [...data]; // 正常：保留0,1,2级，清空3,4级
  data1[3] = 0;
  data1[4] = 0;
  
  var data2 = [...data]; // 关注：只保留3级，其他为0
  for (var i = 0; i < 5; i++) {
    if (i !== 3) {
      data2[i] = 0;
    }
  }
  
  var data3 = [...data]; // 重点关注：只保留4级，其他为0
  for (var i = 0; i < 5; i++) {
    if (i !== 4) {
      data3[i] = 0;
    }
  }
  
  // 更新图表数据集（使用原始 chart 实例）
  rawChart.data.datasets[0].data = data1;
  rawChart.data.datasets[1].data = data2;
  rawChart.data.datasets[2].data = data3;
  
  // 先更新一次图表（按照HTML逻辑：先更新数据，调用update）
  rawChart.update('none');
  
  // 计算Y轴范围
  var maxData = Math.max.apply(null, data);
  var yvalue = Math.ceil(maxData / 10) * 10;
  if (yvalue < 5) {
    yvalue = 5;
  }
  
  // 更新Y轴范围并再次更新图表（按照HTML逻辑：updateYAxisRange函数会再次调用update）
  rawChart.options.scales.y.min = 0;
  rawChart.options.scales.y.max = yvalue;
  rawChart.update('none'); // 按照HTML逻辑，这里需要再次调用update
};

const fetchChartData = async () => {
  console.log('开始请求图表数据');
  const formData = buildFormData();
  
  // 按照原HTML代码的方式处理companyCode和companyName
  // 原HTML: var companyCode = String(dataFiltered.companyCode);
  // 注意：原HTML中即使是null也会被转换为字符串'null'
  const companyCode = filterParams.value.companyCode !== null && filterParams.value.companyCode !== undefined 
    ? String(filterParams.value.companyCode) 
    : 'null';
  const companyName = filterParams.value.companyName !== null && filterParams.value.companyName !== undefined 
    ? String(filterParams.value.companyName) 
    : 'null';
  
  const requestParams = {
    companyCode: companyCode,
    companyName: companyName,
    formData
  };
  
  try {
    // 左侧图表处理：添加局部try-catch，不影响右侧
    try {
      const leftRes = await getLeftChartData(requestParams);
      console.log('左侧接口完整响应：', leftRes);
      console.log('左侧接口返回数据：', leftRes.data); 
      
      // 处理响应数据：可能是res.data，也可能是res本身（数组格式）
      let leftData = leftRes;
      if (leftRes && typeof leftRes === 'object' && 'data' in leftRes) {
        leftData = leftRes.data;
      }
      
      // 严格检查数据格式（必须是数组）
      if (Array.isArray(leftData) && leftChart.value) {
        console.log('准备更新左侧图表，数据：', leftData); 
        await updateChartData(leftChart.value, leftData);
        console.log('左侧图表更新完成，准备调用右侧接口'); 
      } else {
        console.warn('左侧接口返回数据格式不正确（非数组）:', leftData);
      }
    } catch (leftError) {
      console.error('左侧图表处理出错：', leftError);
      const errorMsg = leftError?.message || leftError?.toString() || '未知错误';
      toast.error(`左侧图表数据加载失败：${errorMsg}`);
      // 左侧出错不阻断右侧
    }
    
    // 右侧图表处理（现在即使左侧出错，这里仍会执行）
    try {
      const rightRes = await getRightChartData(requestParams);
      console.log('右侧接口完整响应：', rightRes);
      console.log('右侧接口返回数据：', rightRes.data); 
      
      // 处理响应数据：可能是res.data，也可能是res本身（数组格式）
      let rightData = rightRes;
      if (rightRes && typeof rightRes === 'object' && 'data' in rightRes) {
        rightData = rightRes.data;
      }
      
      if (Array.isArray(rightData) && rightChart.value) {
        console.log('准备更新右侧图表，数据：', rightData);
        await updateChartData(rightChart.value, rightData);
      } else {
        console.warn('右侧接口返回数据格式不正确（非数组）:', rightData);
      }
    } catch (rightError) {
      console.error('右侧图表处理出错：', rightError);
      const errorMsg = rightError?.message || rightError?.toString() || '未知错误';
      toast.error(`右侧图表数据加载失败：${errorMsg}`);
    }
  } catch (error) {
    const errorMsg = error?.message || error?.toString() || '未知错误';
    toast.error(`图表数据加载失败：${errorMsg}`);
    console.error('图表数据加载错误：', error);
  }
};

const checkAccountType = async () => {
  try {
    const res = await judgmentAccount();
    // 检查返回的数据格式
    const accountType = res.data || res;
    if (accountType === "采集账号") {
      showFilterArea.value = false;
      showChartArea.value = false;
    } else {
      showFilterArea.value = true;
      showChartArea.value = true;
    }
  } catch (error) {
    console.error('账号类型判断错误：', error);
    // 默认显示筛选和图表区域
    showFilterArea.value = true;
    showChartArea.value = true;
  }
};

onMounted(async () => {
  const loading = window.$loading?.service({
    fullscreen: true,
    text: '页面加载中...',
  });
  
  try {
    // 检查账号类型
    await checkAccountType();
    
    // 加载任务列表
    await fetchTaskList();
    
    // 从 localStorage 恢复筛选条件
    const hasStoredData = restoreFilterFromStorage();
    
    await nextTick();
    
    // 初始化日期选择器
    initDatePicker();
    
    // 初始化图表
    initCharts();
    
    // 如果有存储的筛选条件或首次加载，则请求数据
    if (hasStoredData) {
      await fetchTopStatistics();
      await fetchChartData();
    } else {
      // 首次加载时也使用默认条件查询
      await fetchTopStatistics();
      await fetchChartData();
    }
  } catch (error) {
    const errorMsg = error?.message || error?.toString() || '未知错误';
    toast.error(`页面加载失败：${errorMsg}`);
    console.error('页面加载错误：', error);
  } finally {
    loading?.close();
  }
});
</script>

<!-- 全局样式：不添加scoped，确保作用于body等全局标签 -->
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
li {
  list-style: none;
}
body {
  height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: #0a192f; /* 深蓝色背景 */
  line-height: 1.15;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>

<!-- 局部样式：添加scoped，仅作用于当前组件 -->
<style scoped>
/* 主内容容器：同步背景色确保全屏覆盖 */
.content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: url('/js/static/image/win2.jpg') no-repeat center center;
}

/* 头部统计卡片区域 */
.header {
  position: relative;
  height: 17vh;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 20px;
  
}
#virtualBox1,
#virtualBox2,
#virtualBox3,
#virtualBox4,
#virtualBox5 {
  width: 20px;
  height: 100%;
}

/* 筛选区域样式 */
.middle {
  position: relative;
  height: 6.5vh;
}
.comprehensive_data {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10px;
}
.fl {
  width: 12%; 
  display: flex;
  align-items: center;
}
.fl p {
  margin-left: 10px;
  color: #fff;
  font-size: 24px;
  line-height: 32px;
}
.fr {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  padding-right: 10px;
  overflow-x: auto;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.filter-label {
  width: auto;
  color: #fff;
  font-size: 16px;
  white-space: nowrap;
}
.time-filter {
  flex: 0 0 auto;
  min-width: 0;
}
.time-filter .layui-form {
  width: auto;
}
.time-filter .layui-form-item {
  margin-bottom: 0;
  width: auto;
}
.time-filter .layui-input-inline {
  margin-right: 0;
}
.time-filter .layui-form-mid {
  padding: 0 5px;
}
.dept-filter {
  flex: 0 0 calc(13% - 8px);
}
.task-filter {
  flex: 0 0 calc(13% - 8px);
}
.layui-select {
  width: 100%;
}

/* 性别筛选框的 placeholder 颜色，与时间筛选框一致 */
.gender-filter .layui-select {
  color: #333;
}

/* 当选中 placeholder option（值为空）时，文字颜色为灰色 */
.gender-filter .layui-select.placeholder-selected {
  color: #999;
}

/* 设置 option 的颜色 */
.gender-filter .layui-select option {
  color: #333;
}

.gender-filter .layui-select option[value=""] {
  color: #999;
}

.gender-filter {
  flex: 0 0 calc(12% - 8px);
}
.age-filter {
  flex: 0 0 calc(15% - 8px);
}
.age-range {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
}
.age-separator {
  color: #fff;
  font-size: 16px;
}
.btn-filter {
  flex: 0 0 calc(20% - 8px);
  display: flex;
  gap: 5px;
  justify-content: flex-end;
}
.query-btn {
  background-color: #0096ff;
  color: #fff;
  border: none;
  padding: 6px 25px;
  cursor: pointer;
  border-radius: 4px;
  text-align: center;
  min-width: 80px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.reset-btn {
  background-color: #00b42a;
  color: #fff;
  border: none;
  padding: 6px 25px;
  cursor: pointer;
  border-radius: 4px;
  text-align: center;
  min-width: 80px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
/*部别 输入框的css*/
:deep(.treeselect .form-control),
:deep(.form-control.laydate) {
  background-color: #ffffff !important;
  color: #757575;
}
:deep(.input-group-btn .btn),
:deep(.treeSearchInput button),
:deep(.treeSearchInput button:hover),
:deep(.treeSearchInput button:focus) {
  background-color: #ffffff !important;
  color: #757575;
}
.layui-input, .layui-select {
  height: 30px;
  padding: 0 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  width: 100%;
}

/* 时间筛选框 placeholder 颜色（layui 默认） */
.layui-input::placeholder {
  color: #999;
}

/* TreeSelect 和 Select 组件样式 */
:deep(.ant-select),
:deep(.ant-tree-select) {
  width: 100%;
}

:deep(.ant-select-selector),
:deep(.ant-tree-select-selector) {
  height: 30px !important;
  border-radius: 2px !important;
  background-color: rgba(255, 255, 255, 0.8) !important;
}

/* 部别和任务筛选框的 placeholder 颜色，与时间筛选框一致 */
.dept-filter :deep(.ant-select-selection-placeholder),
.dept-filter :deep(.ant-tree-select-selection-placeholder),
.task-filter :deep(.ant-select-selection-placeholder) {
  color: #999 !important;
  opacity: 1 !important;
}

/* 任务多选框内已选标签样式，参照原HTML页面（蓝色背景#1e9fff，白色文字） */
.task-filter :deep(.ant-select-selection-item) {
  background-color: #1e9fff !important;
  border: none !important;
  border-radius: 2px !important;
  color: #ffffff !important;
  padding: 0 8px 0 8px !important;
  line-height: 28px !important;
}

.task-filter :deep(.ant-select-selection-item-content) {
  color: #ffffff !important;
}

/* 删除图标（叉号）样式 */
.task-filter :deep(.ant-select-selection-item-remove) {
  color: #ffffff !important;
  opacity: 1 !important;
}

.task-filter :deep(.ant-select-selection-item-remove:hover) {
  color: #ffffff !important;
  opacity: 0.8 !important;
}

/* 确保下拉箭头（三角图标）显示 */
.task-filter :deep(.ant-select-arrow) {
  color: #fd2f2f !important;
  display: inline-block !important;
}

.task-filter :deep(.ant-select-selector) {
  display: flex !important;
  align-items: center;
  overflow-x: auto;
  white-space: nowrap;
  padding-right: 24px !important;
}

.task-filter :deep(.ant-select-selection-overflow) {
  flex-wrap: nowrap !important;
}

.task-filter :deep(.ant-select-selection-overflow-item) {
  margin-right: 6px !important;
}

:deep(.ant-select-selection-item),
:deep(.ant-tree-select-selection-item) {
  line-height: 28px !important;
}

/* 图表区域样式 */
.main_chart {
  flex: 1 1 auto;
  overflow: hidden; /* 去掉滚动条 */
  margin: 10px auto 0;
  padding: 1rem 0.125rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 确保flex子元素可以正确收缩 */
}
.charts-container {
  flex: 1;
  display: flex;
  width: 100%;
  min-height: 0; /* 确保flex子元素可以正确收缩 */
}
.chart_box {
  position: relative;
  flex: 1;
  width: 50%;
  height: 100%;
  padding: 0rem 3rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
  min-height: 0; /* 确保flex子元素可以正确收缩 */
}
.chart_box canvas {
  width: 100%;
  height: 100%;
}
.legendContainer {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.legend-left, .legend-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.legend1, .legend2, .legend3 {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: white;
  font-size: 16px;
  width: 70px;
  height: 26px;
  border-radius: 3px;
  border: none;
}
.legend1 {
  background-color: #4CAF50;
}
.legend2 {
  background-color: #c8c533;
}
.legend3 {
  background-color: #f44336;
}
.legend4 {
  font-size: 18px;
  color: #e0efff;
  font-weight: 500;
}
</style>