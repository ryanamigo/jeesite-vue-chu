<template>
  <div class="content" style="flex: 1; display: flex; flex-direction: column">
    <!-- 头部统计卡片区域 -->
    <div class="header">
      <!-- 总人数卡片 -->
      <div class="data_box item" @click="handleCardJump('data_box1_headcount', '总人数详情')">
        <div class="textInfo">
          <p>总人数</p>
          <span class="headcount">{{ topStat.headcount || 0 }}</span>
        </div>
        <div class="img">
          <img src="@jeesite/assets/images/总人数.png" alt="总人数图标" style="width: 80%" />
        </div>
      </div>
      <div id="virtualBox1"></div>

      <!-- 总次数卡片 -->
      <div class="data_box item" @click="handleCardJump('data_box2_totalTimes', '总次数详情')">
        <div class="textInfo">
          <p>总次数</p>
          <span class="totalTimes">{{ topStat.totalTimes || 0 }}</span>
        </div>
        <div class="img">
          <img src="@jeesite/assets/images/总次数.png" alt="总次数图标" style="width: 80%" />
        </div>
      </div>
      <div id="virtualBox2"></div>

      <!-- 今日检测人数卡片 -->
      <div class="data_box item" @click="handleCardJump('data_box3_headcount_today', '今日检测人数详情')">
        <div class="textInfo">
          <p>今日检测人数</p>
          <span class="headcount_today">{{ topStat.headcountToday || 0 }}</span>
        </div>
        <div class="img">
          <img src="@jeesite/assets/images/今日检测人数.png" alt="今日检测人数图标" style="width: 80%" />
        </div>
      </div>
      <div id="virtualBox3"></div>

      <!-- 今日检测次数卡片 -->
      <div class="data_box item" @click="handleCardJump('data_box4_totalTimes_today', '今日检测次数详情')">
        <div class="textInfo">
          <p>今日检测次数</p>
          <span class="totalTimes_today">{{ topStat.totalTimesToday || 0 }}</span>
        </div>
        <div class="img">
          <img src="@jeesite/assets/images/今日检测次数.png" alt="今日检测次数图标" style="width: 80%" />
        </div>
      </div>
      <div id="virtualBox4"></div>

      <!-- 无效视频数据卡片 -->
      <div class="data_box item" @click="handleCardJump('data_box5_ineffectiveVideo', '无效视频数据详情')">
        <div class="textInfo">
          <p>无效视频数据</p>
          <span class="ineffectiveVideo">{{ topStat.ineffectiveVideo || 0 }}</span>
        </div>
        <div class="img">
          <img src="@jeesite/assets/images/无效视频.png" alt="无效视频图标" style="width: 80%" />
        </div>
      </div>
      <div id="virtualBox5"></div>
    </div>

    <!-- 筛选区域 -->
    <div class="middle" v-if="showFilterArea">
      <div style="border: 1px solid #007bff;"></div>
      <div class="comprehensive_data">
        <div class="fl"><p>综合数据</p></div>
        <div class="fr">
          <!-- 时间筛选项 -->
          <div class="filter-item time-filter">
            <p class="filter-label">时间</p>
            <div class="date-range">
              <input type="date" v-model="filterParams.startTime" class="layui-input" placeholder="开始日期">
              <span class="date-separator">-</span>
              <input type="date" v-model="filterParams.endTime" class="layui-input" placeholder="结束日期">
            </div>
          </div>

          <!-- 部别筛选项 -->
          <div class="filter-item dept-filter">
            <p class="filter-label">部别</p>
            <div class="dept-input-group">
              <input type="text" v-model="filterParams.companyCode" class="layui-input" placeholder="部别">
              <button class="search-icon" @click="handleDeptSearch">🔍</button>
            </div>
          </div>

          <!-- 任务筛选项 -->
          <div class="filter-item task-filter">
            <p class="filter-label">任务</p>
            <select v-model="filterParams.testNumbers" class="layui-select">
              <option value="">请选择</option>
              <option v-for="task in taskList" :key="task.value" :value="task.value">{{ task.name }}</option>
            </select>
          </div>

          <!-- 性别筛选项 -->
          <div class="filter-item gender-filter">
            <p class="filter-label">性别</p>
            <select v-model="filterParams.gender" class="layui-select">
              <option value="">请选</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>

          <!-- 年龄筛选项 -->
          <div class="filter-item age-filter">
            <p class="filter-label">年龄</p>
            <div class="age-range">
              <input type="number" v-model="filterParams.startAge" class="layui-input" placeholder="最小" min="0">
              <span class="age-separator">-</span>
              <input type="number" v-model="filterParams.endAge" class="layui-input" placeholder="最大" min="0">
            </div>
          </div>

          <!-- 按钮区域 -->
          <div class="filter-item btn-filter">
            <button class="layui-btn query-btn" @click="handleQuery">查询</button>
            <button class="layui-btn reset-btn" @click="handleReset">重置</button>
          </div>
        </div>
      </div>
      <div style="border: 1px solid #007bff;"></div>
    </div>

    <!-- 图表区域 -->
    <div class="main_chart" v-if="showChartArea">
      <div class="legendContainer" style="height: 5vh">
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
      <div class="chart_box">
        <canvas id="myChart1"></canvas>
      </div>
      <div class="chart_box">
        <canvas id="myChart2"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from '@jeesite/core/hooks/web/useMessage';
import { 
  judgmentAccount, 
  getTopStatistics,
  getTaskList,
  getLeftChartData,
  getRightChartData
} from '@jeesite/core/api/emotion/emotion';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const router = useRouter();
const { toast } = useMessage();

// 状态变量
const topStat = ref({
  headcount: 0,
  totalTimes: 0,
  headcountToday: 0,
  totalTimesToday: 0,
  ineffectiveVideo: 0,
});
const filterParams = ref({
  startTime: null,
  endTime: null,
  companyCode: null,
  companyName: null,
  testNumbers: [],
  gender: null,
  startAge: null,
  endAge: null
});
const taskList = ref([]);
const showFilterArea = ref(true);
const showChartArea = ref(true);
const leftChart = ref(null);
const rightChart = ref(null);

// 卡片点击跳转方法
const handleCardJump = (id, title) => {
  toast.info(`准备跳转到${title}页面`);
};

// 部别搜索方法（示例，可根据实际需求完善）
const handleDeptSearch = () => {
  toast.info('部别搜索功能待完善');
};

// 获取筛选参数
const getFilterParams = () => {
  return { ...filterParams.value };
};

// 处理查询
const handleQuery = async () => {
  const loading = window.$loading?.service({
    text: '正在查询数据...',
  });
  
  try {
    await fetchTopStatistics();
    await fetchChartData();
  } catch (error) {
    toast.error(`查询失败：${error.message || '未知错误'}`);
    console.error('查询错误：', error);
  } finally {
    loading?.close();
  }
};

// 处理重置
const handleReset = () => {
  filterParams.value = {
    startTime: '',
    endTime: '',
    companyCode: '',
    companyName: '',
    testNumbers: [],
    gender: '',
    startAge: '',
    endAge: ''
  };
  handleQuery();
};

const buildFormData = () => {
  const fd = new FormData();
  const params = getFilterParams();
  
  Object.keys(params).forEach(key => {
    if (key === 'companyCode' || key === 'companyName') {
      return;
    }
    if (key === 'testNumbers' && Array.isArray(params[key])) {
      fd.append(key, params[key].join(','));
    } else {
      fd.append(key, params[key] ?? 'null');
    }
  });
  
  return fd;
};

// 获取顶部统计数据
const fetchTopStatistics = async () => {
  console.log('开始请求顶部统计数据');
  const formData = buildFormData();
  const requestParams = {
    companyCode: filterParams.value.companyCode,
    companyName: filterParams.value.companyName,
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

// 获取任务列表
const fetchTaskList = async () => {
  try {
    const res = await getTaskList();
    taskList.value = (res.data || []).map(task => ({
      value: task.testNumber,
      name: task.testNumberName
    }));
  } catch (error) {
    toast.error(`任务列表加载失败：${error.message}`);
    console.error('任务列表加载错误：', error);
    await fetchChartData(); 
  }
};

// 初始化图表
const initCharts = () => {
  // 左侧图表 - 综合心理排序
  const ctx1 = document.getElementById('myChart1').getContext('2d');
  leftChart.value = new Chart(ctx1, {
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
          barPercentage: 0.3,
        },
        {
          label: '关注',
          backgroundColor: '#c8c533',
          borderColor: '#c8c533',
          borderWidth: 1,
          data: [0, 0, 0, 0, 0],
          barPercentage: 0.3,
        },
        {
          label: '重点关注',
          backgroundColor: '#f44336',
          borderColor: '#f44336',
          borderWidth: 1,
          data: [0, 0, 0, 0, 0],
          barPercentage: 0.3,
        }
      ]
    },
    options: getChartOptions(),
    plugins: [ChartDataLabels]
  });

  // 右侧图表 - 建模跟踪排序
  const ctx2 = document.getElementById('myChart2').getContext('2d');
  rightChart.value = new Chart(ctx2, {
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
          barPercentage: 0.3,
        },
        {
          label: '关注',
          backgroundColor: '#c8c533',
          borderColor: '#c8c533',
          borderWidth: 1,
          data: [0, 0, 0, 0, 0],
          barPercentage: 0.3,
        },
        {
          label: '重点关注',
          backgroundColor: '#f44336',
          borderColor: '#f44336',
          borderWidth: 1,
          data: [0, 0, 0, 0, 0],
          barPercentage: 0.3,
        }
      ]
    },
    options: getChartOptions(),
    plugins: [ChartDataLabels]
  });
};

// 获取图表配置
const getChartOptions = () => {
  return {
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: function(context) {
          return context.dataset.data[context.dataIndex] > 0;
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
        ticks: {
          color: 'white',
          font: {
            size: 16
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          color: 'white',
          font: {
            size: 16
          }
        },
        grid: {
          display: false
        }
      }
    },
    onClick: function(event, elements) {
      if (elements.length > 0) {
        const index = elements[0].index;
        toast.info(`点击了第${index + 1}级数据`);
      }
    }
  };
};

// 更新图表数据
const updateChartData = (chart, data) => {
  if (!chart) return;
  
  const dataNormal = [...data];
  dataNormal[3] = 0;
  dataNormal[4] = 0;
  
  const dataAttention = data.map((item, index) => index === 2 ? item : 0);
  
  const dataFocus = [...data];
  dataFocus[0] = 0;
  dataFocus[1] = 0;
  dataFocus[2] = 0;
  
  chart.data.datasets[0].data = dataNormal;
  chart.data.datasets[1].data = dataAttention;
  chart.data.datasets[2].data = dataFocus;
  
  const maxData = Math.max(...data);
  const yMax = maxData > 0 ? Math.ceil(maxData / 10) * 10 : 5;
  chart.options.scales.y.max = yMax < 5 ? 5 : yMax;
  
  chart.update();
};

// 获取图表数据
const fetchChartData = async () => {
  console.log('开始请求图表数据');
  const formData = buildFormData();
  const requestParams = {
    companyCode: filterParams.value.companyCode,
    companyName: filterParams.value.companyName,
    formData
  };
  
  try {
    const leftRes = await getLeftChartData(requestParams);
    if (leftRes.data && leftChart.value) {
      updateChartData(leftChart.value, leftRes.data);
    }
    
    const rightRes = await getRightChartData(requestParams);
    if (rightRes.data && rightChart.value) {
      updateChartData(rightChart.value, rightRes.data);
    }
  } catch (error) {
    toast.error(`图表数据加载失败：${error.message}`);
    console.error('图表数据加载错误：', error);
  }
};

// 判断账号类型
const checkAccountType = async () => {
  try {
    const res = await judgmentAccount();
    if (res.data === "采集账号") {
      showFilterArea.value = false;
      showChartArea.value = false;
    }
  } catch (error) {
    console.error('账号类型判断错误：', error);
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
    await checkAccountType();
    await fetchTaskList();
    await nextTick();
    initCharts();
    await fetchTopStatistics();
    await fetchChartData();
  } catch (error) {
    toast.error(`页面加载失败：${error.message || '请刷新页面重试'}`);
    console.error('页面加载错误：', error);
  } finally {
    loading?.close();
  }
});
</script>

<style scoped>
/* 全局基础样式 */
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
  background: url('/js/static/image/win2.jpg') no-repeat center center;
  background-size: cover;
  line-height: 1.15;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 主内容容器 */
.content {
  display: flex;
  flex-direction: column;
  height: 100vh;
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
.data_box {
  position: relative;
  flex: 1;
  max-width: 20%;
  height: 90%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('/images/tit-01.png') no-repeat center center;
  background-size: 90% 85%;
}
.data_box .textInfo {
  float: left;
  text-align: center;
  width: 50%;
}
.data_box .textInfo p {
  color: #9afefe;
  font-size: 20px;
  margin-bottom: 8px;
}
.data_box .textInfo span {
  color: #e2dd0a;
  font-size: 32px;
  font-weight: bold;
}
.data_box .img {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  float: right;
}
#virtualBox1,
#virtualBox2,
#virtualBox3,
#virtualBox4,
#virtualBox5 {
  width: 20px;
  height: 100%;
}

/* 筛选区域 核心调整 */
.middle {
  position: relative;
  height: 8vh; 
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

/* 右侧筛选项容器：强制一行 + 缩小间距 */
.fr {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: nowrap; /* 强制所有筛选项在一行（不换行） */
  gap: 8px; /* 减小筛选项之间的间距 */
  padding-right: 10px;
  overflow-x: auto; /* 屏幕过小时显示横向滚动条，避免溢出 */
}

/* 筛选项通用样式 */
.filter-item {
  display: flex;
  align-items: center;
  gap: 5px; /* 标签与输入框的间距 */
}
.filter-label {
  width: auto;
  color: #fff;
  font-size: 16px;
  white-space: nowrap; /* 防止标签换行 */
}

/* 时间筛选：调整占比 + 内部间距 */
.time-filter {
  flex: 0 0 calc(22% - 8px); /* 缩小占比，适配一行 */
}
.date-range {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
}
.date-separator {
  color: #fff;
  font-size: 16px;
}

/* 部别筛选：调整占比 + 搜索按钮样式 */
.dept-filter {
  flex: 0 0 calc(13% - 8px);
}
.dept-input-group {
  display: flex;
  align-items: center;
  width: 100%;
}
.dept-input-group input {
  flex: 1;
  border-radius: 4px 0 0 4px;
  width: 100%;
}
.search-icon {
  background-color: #007bff; /* 搜索按钮加背景色，更醒目 */
  color: #fff;
  border: none;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 任务筛选：调整占比 */
.task-filter {
  flex: 0 0 calc(13% - 8px);
}
.layui-select {
  width: 100%; /* 选择器填满父容器 */
}

/* 性别筛选：调整占比 */
.gender-filter {
  flex: 0 0 calc(8% - 8px);
}

/* 年龄筛选：调整占比 + 内部间距 */
.age-filter {
  flex: 0 0 calc(13% - 8px);
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

/* 按钮区域：缩小按钮间距 */
.btn-filter {
  flex: 0 0 calc(20% - 8px);
  display: flex;
  gap: 5px; /* 减小查询/重置按钮的间距 */
  justify-content: flex-end;
}
.query-btn {
  background-color: #0096ff;
  color: #fff;
  border: none;
  padding: 6px 15px;
  cursor: pointer;
  border-radius: 4px;
}
.reset-btn {
  background-color: #00b42a;
  color: #fff;
  border: none;
  padding: 6px 15px;
  cursor: pointer;
  border-radius: 4px;
}

/* 表单元素通用样式：确保填满容器 */
.layui-input, .layui-select {
  height: 30px;
  padding: 0 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  width: 100%; /* 输入框/选择器填满父容器 */
}

/* 图表区域（保持不变） */
.main_chart {
  flex: 1 1 auto;
  overflow-y: auto;
  margin: 10px auto 0;
  padding: 1rem 0.125rem;
  width: 100%;
}
.chart_box {
  position: relative;
  flex: 1;
  float: left;
  width: 50%;
  height: calc(100vh - 17vh - 8vh - 20px); /* 适配高度 */
  padding: 0rem 3rem;
  display: flex;
  justify-content: space-around;
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