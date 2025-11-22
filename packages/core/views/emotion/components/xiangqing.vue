<template>
  <div :class="prefixCls" style="height: 100vh;">
    <!-- 顶部导出按钮（对应HTML的height: 4vh） -->
    <div class="export-bar">
      <button
        id="downloadPDF"
        :disabled="exportLoading"
        @click="handleExportPdf"
      >
        {{ exportLoading ? '正在导出...' : exportButtonLabel }}
      </button>
    </div>

    <!-- 主内容区 -->
    <div class="layout-wrapper" style="height: 94vh; width: 100%;"> <!-- 对应HTML的#layout-wrapper height: 94vh -->
      <!-- 左侧区域（对应HTML的.box1，width: 40%, float: left） -->
      <div class="left-container box1">
        <Card class="left-card top-card">
          <div class="personal-info">
            <h4 class="card-title">个人信息</h4>
            <Row :gutter="16">
              <Col span="12">
                <FormItem label="姓名" class="form-item">
                  <Input v-model:value="formState.pname" />
                </FormItem>
                <FormItem label="性别" class="form-item">
                  <Input v-model:value="formState.pgender"/>
                </FormItem>
                <FormItem label="年龄" class="form-item">
                  <Input v-model:value="formState.age" />
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem label="编号" class="form-item">
                  <Input v-model:value="formState.pidcard" />
                </FormItem>
                <FormItem label="部别" class="form-item">
                  <Input v-model:value="formState.pposition"/>
                </FormItem>
              </Col>
            </Row>

            <!-- 结果表格（筛选区域已删除） -->
            <Table
              :columns="resultColumns"
              :data-source="resultTableData"
              row-key="id"
              :pagination="false"
              @row-click="handleRowClick"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column && column.dataIndex === 'action'">
                  <a style="color:#008ad4; cursor: pointer" @click.stop="handleDetailClick(record as ResultTableItem)">详情</a>
                </template>
                <template v-else-if="column && column.dataIndex === 'psychologyStatus'">
                  <!-- 确保显示转换后的文字，而不是数字 -->
                  {{ convertPsychologyStatus(record.psychologyStatusNum ?? 0) }}
                </template>
                <template v-else-if="column && column.dataIndex === 'alarmStatus'">
                  <!-- 确保显示转换后的文字，而不是数字 -->
                  {{ convertAlarmStatus(record.alarmStatusNum ?? 0) }}
                </template>
              </template>
            </Table>
          </div>
        </Card>

        <!-- 左侧下：指标按钮与图表 -->
        <Card class="left-card bottom-card">
          <div class="index-buttons">
            <a-button
              v-for="(item, index) in indexButtons"
              :key="index"
              :class="{ active: activeIndex === item.key }"
              @click="handleIndexClick(item.key)"
            >
              {{ item.label }}
            </a-button>
          </div>
          <div class="chart-container">
            <div ref="chartRef" class="echart-dom"></div>
            <div v-if="!hasData" class="no-data">暂无数据</div>
          </div>
        </Card>
      </div>

      <!-- 右侧区域（对应HTML的.box2，width: 58%, float: left） -->
      <div class="box2">
        <!-- 右侧容器（对应HTML的.right-box） -->
        <div class="right-container">
          <!-- 右侧上：综合结果（对应HTML的.rightTop，height: 25%） -->
          <div class="rightTop">
            <h4 class="card-title">综合结果</h4>
            <div style="flex-direction: column; float: left; display: flex; align-items: center; margin-left: 25%;">
              <div class="stat-card" :style="psychologyStatusStyle">
                <div class="stat-value">{{ psychologyStatus }}</div>
              </div>
              <div style="flex-direction: row;">
                <h2>心理状态</h2>
              </div>
            </div>
            <div style="flex-direction: column; float: right; display: flex; align-items: center; margin-right: 25%;">
              <div class="stat-card" :style="alarmStatusStyle">
                <div class="stat-value">{{ alarmStatus }}</div>
              </div>
              <div style="flex-direction: row;">
                <h2>跟踪状态</h2>
              </div>
            </div>
          </div>

          <!-- 右侧中：指标说明和建议（对应HTML的.rightMid，height: 25%） -->
          <div class="rightMid">
            <h4 class="card-title">指标说明和建议</h4>
            <div class="suggestion-list">
              <h3 class="suggestion-item">{{ annotationType || '暂无指标说明' }}</h3>
              <h3 class="suggestion-item">{{ annotation || '暂无详细建议' }}</h3>
              <h3 class="suggestion-item">{{ annotationSum || '暂无总结信息' }}</h3>
            </div>
          </div>

          <!-- 右侧下：具体指标和雷达图（对应HTML的.rightBtm，height: 50%） -->
          <div class="rightBtm">
            <h4 class="card-title">具体指标</h4>
            <!-- 具体指标表格（对应HTML的.chart，宽度60%，高度90%） -->
            <div class="chart">
              <div class="index-table">
                <Table
                  :columns="indexColumns"
                  :data-source="indexTableData"
                  row-key="index"
                  bordered
                  :scroll="{ y: '100%' }"
                  :pagination="false"
                >
                  <template #bodyCell="{ column, record }">
                    <template v-if="column && column.dataIndex === 'result'">
                      <span :style="{ color: record.result === '正常' ? 'green' : 'red' }">
                        {{ record.result || '未评估' }}
                      </span>
                    </template>
                  </template>
                </Table>
              </div>
            </div>
            <!-- 雷达图区域（对应HTML的.radarSide，宽度40%，高度90%） -->
            <div class="radarSide">
              <div v-if="radarImages.length === 0" class="no-data" style="font-size: 16px">
                暂无雷达图数据
              </div>
              <div v-else v-for="(item, index) in radarImages" :key="index" class="radar-item container">
                <span class="radar-label">{{ item.label }}</span>
                <img :src="item.url" alt="雷达图" class="radar-img" @error="e => { const target = e.target as HTMLImageElement; if (target) { target.style.display = 'none'; } }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { Card, Layout, Row, Col, Table, Input, FormItem } from 'ant-design-vue';
import type { TableColumnType } from 'ant-design-vue';
import * as echarts from 'echarts';
import { useMessage } from '@jeesite/core/hooks/web/useMessage';
import { 
  getTaskList,
  getPersonalData, 
  getGroupRange, 
  getTrackingData, 
  getSelfRange,
  getMentalStateByPidcard,
  getSuggestionText,
  getSuggestionText2,
  getSuggestionText3,
  generateRadarImage,
  exportPdf 
} from '@jeesite/core/api/emotion/xiangqing';

// 类型定义（已删除筛选相关类型）
interface PersonalForm {
  pname: string;
  pgender: string;
  age: string;
  pidcard: string;
  pposition: string;
}

interface ResultTableItem {
  id: string;
  createdAt: string;
  testNumberName: string;
  psychologyStatus: string;
  alarmStatus: string;
  [key: string]: any;
}

interface IndexButton {
  key: string;
  label: string;
}

// 组件变量（已删除筛选相关状态：selectedTask、dateRange、taskOptions）
const prefixCls = 'psychology-detail';
const route = useRoute();
const { createMessage } = useMessage();
const chartRef = ref<HTMLDivElement | null>(null);
let myChart: echarts.ECharts | null = null;

// 状态管理（已删除筛选相关状态）
const formState = reactive<PersonalForm>({
  pname: '',
  pgender: '',
  age: '',
  pidcard: '',
  pposition: '',
});
const resultTableData = ref<ResultTableItem[]>([]);
const activeIndex = ref('trackingIndex');
const hasData = ref(false);
const dataLength = ref(0); // 详情页面echarts有无数据
const psychologyStatus = ref('待评估');
const alarmStatus = ref('待跟踪');
const annotationType = ref('');
const annotation = ref('');
const annotationSum = ref('');
const radarImages = ref<{ label: string; url: string }[]>([]);
const exportLoading = ref(false);
const exportButtonLabel = ref('导出本次报告');
const indexTableData = ref<any[]>([]);
const videoId = ref<string>('');
const taskOptions = ref<Array<{ testNumber: string; testNumberName: string }>>([]); // 任务列表（对应HTML的taskSelection）

// 群体建模范围
const groupRange1 = ref<number[]>([]);
const groupRange2 = ref<number[]>([]);

// 个体建模范围
const selfRange1 = ref<number[]>([]);
const selfRange2 = ref<number[]>([]);
const modelStatus = ref<number>(0);

// 图表数据
const times = ref<string[]>([]);
const indexData = reactive({
  trackingIndexData10: [] as number[],
  aggression10: [] as number[],
  stress10: [] as number[],
  tension10: [] as number[],
  fatigue10: [] as number[],
  charm10: [] as number[],
  energy10: [] as number[],
  regulation10: [] as number[],
  depressionRage10: [] as number[],
});
const axisRanges = reactive({
  mintrackingIndexData10: 0,
  minaggression10: 0,
  minstress10: 0,
  mintension10: 0,
  minfatigue10: 0,
  mincharm10: 0,
  minenergy10: 0,
  minregulation10: 0,
  mindepressionRage10: 0,
});

// 表格列定义（无筛选相关变更）
const resultColumns: TableColumnType<ResultTableItem>[] = [
  { title: '时间', dataIndex: 'createdAt', width: '30%', ellipsis: true },
  { title: '任务批次', dataIndex: 'testNumberName', width: '20%', ellipsis: true },
  { title: '心理状态', dataIndex: 'psychologyStatus', width: '15%', ellipsis: true },
  { title: '跟踪状态', dataIndex: 'alarmStatus', width: '25%', ellipsis: true },
  { title: '详情', dataIndex: 'action', width: '10%', align: 'center' },
];

const indexColumns: TableColumnType<any>[] = [
  { title: '项目', dataIndex: 'name', width: '15%', ellipsis: true },
  { title: '群体建模范围', dataIndex: 'groupRange', width: '20%', ellipsis: true },
  { title: '心理测评值', dataIndex: 'score', width: '15%', align: 'center' },
  { title: '判定', dataIndex: 'result', width: '15%', align: 'center' },
  { title: '个体建模范围', dataIndex: 'selfRange', width: '20%', ellipsis: true },
  { title: '跟踪偏离指数', dataIndex: 'deviation', width: '15%', align: 'center' },
];

// 指标名称映射（用于表格显示）
const indexNameMap: Record<string, string> = {
  'tension': '焦虑',
  'fatigue': '疲劳',
  'charm': '平衡',
  'energy': '能量',
  'regulation': '稳定',
  'depression': '压抑',
  'aggression': '紧张',
  'stress': '压力',
};

// 指标按钮配置（无变更）
const indexButtons: IndexButton[] = [
  { key: 'trackingIndex', label: '跟踪' },
  { key: 'aggressionIndex', label: '紧张' },
  { key: 'stressIndex', label: '压力' },
  { key: 'tensionIndex', label: '焦虑' },
  { key: 'fatigueIndex', label: '疲劳' },
  { key: 'charmIndex', label: '平衡' },
  { key: 'energyIndex', label: '能量' },
  { key: 'regulationIndex', label: '稳定' },
  { key: 'depressionRageIndex', label: '压抑' },
];

// 生命周期
onMounted(() => {
  initPageParams();
  initChart();
  loadInitialData();
});

// 初始化页面参数
const initPageParams = () => {
  const { pname, pgender, age, pidcard, ppositionName, sid } = route.query;
  // 确保所有参数都被正确获取，包括HTML中的sid参数
  formState.pname = typeof pname === 'string' ? pname : '';
  formState.pgender = typeof pgender === 'string' ? pgender : '';
  formState.age = typeof age === 'string' ? age : '';
  formState.pidcard = typeof pidcard === 'string' ? pidcard : '';
  formState.pposition = typeof ppositionName === 'string' ? ppositionName : '';
};

// 图表初始化状态
const chartInitialized = ref(false);
let initChartRetryCount = 0;
const MAX_RETRY_COUNT = 20; // 最大重试次数，避免无限循环

// 初始化图表
const initChart = () => {
  // 如果重试次数过多，停止重试
  if (initChartRetryCount >= MAX_RETRY_COUNT) {
    console.error('图表初始化失败：已达到最大重试次数');
    createMessage.error('图表容器无法获取尺寸，请检查CSS样式');
    return;
  }
  
  initChartRetryCount++;
  
  // 延迟初始化，确保 DOM 已经渲染完成并有尺寸（对应HTML的DOMContentLoaded延迟1秒）
  setTimeout(() => {
    nextTick(() => {
      const chartElement = chartRef.value;
      
      // 调试信息：输出容器元素和尺寸信息
      if (chartElement) {
        const computedStyle = window.getComputedStyle(chartElement);
        console.log('图表容器检查：', {
          element: chartElement,
          clientWidth: chartElement.clientWidth,
          clientHeight: chartElement.clientHeight,
          offsetWidth: chartElement.offsetWidth,
          offsetHeight: chartElement.offsetHeight,
          display: computedStyle.display,
          height: computedStyle.height,
          width: computedStyle.width,
          parentHeight: chartElement.parentElement?.clientHeight,
          retryCount: initChartRetryCount
        });
      }
      
      if (chartElement && chartElement.clientWidth > 0 && chartElement.clientHeight > 0) {
        try {
          // 如果图表已存在，先销毁（对应HTML中每次showChart都重新初始化）
          if (myChart) {
            myChart.dispose();
            myChart = null;
          }
          
          // 重新初始化图表（对应HTML行649：每次showChart都echarts.init）
          myChart = echarts.init(chartElement);
          chartInitialized.value = true;
          initChartRetryCount = 0; // 重置重试计数
          
          // 监听窗口resize事件
          const resizeHandler = () => {
            myChart?.resize();
          };
          window.addEventListener('resize', resizeHandler);
          
          console.log('图表初始化成功，容器尺寸：', chartElement.clientWidth, 'x', chartElement.clientHeight);
          
          // 图表初始化成功后，延迟渲染，等待数据加载完成
          // 对应HTML中DOMContentLoaded延迟1秒显示图表（行488-492）
          setTimeout(() => {
            // 检查跟踪数据是否已加载
            if (indexData.trackingIndexData10.length > 0 && times.value.length > 0) {
              console.log('图表初始化完成，跟踪数据已就绪，渲染图表');
              handleIndexClick('trackingIndex');
            } else {
              console.log('图表初始化完成，但跟踪数据未就绪，等待数据加载...');
              // 如果没有数据，显示空图表
              handleIndexClick('trackingIndex');
            }
          }, 500);
        } catch (error) {
          console.error('图表初始化失败：', error);
          createMessage.error('图表加载失败，请刷新页面重试');
          chartInitialized.value = false;
        }
      } else {
        console.warn('图表容器还没有尺寸，延迟重试... (重试次数:', initChartRetryCount, ')');
        // 如果 DOM 还没有尺寸，延迟重试（增加延迟时间，给CSS更多时间渲染）
        setTimeout(() => initChart(), 200);
      }
    });
  }, 200);
};

// 状态转换：数字到文字
const convertPsychologyStatus = (status: number): string => {
  if (status === 0) return '正常';
  if (status === 1) return '一般';
  if (status === 2) return '关注';
  return '待评估';
};

const convertAlarmStatus = (status: number): string => {
  if (status === 0) return '未跟踪';  // 用户要求显示"非跟踪"而不是"未跟踪"
  if (status === 1) return '正常';
  if (status === 2) return '一般';
  if (status === 3) return '关注';
  return '未跟踪';
};

// 初始化表格2（具体指标表格）表头
const initIndexTable = () => {
  // 对应HTML的creatChart2，初始化表格数据结构
  // 顺序与雷达图一致：紧张、压力、焦虑、疲劳、平衡、能量、稳定、压抑
  const indexNames = ['紧张', '压力', '焦虑', '疲劳', '平衡', '能量', '稳定', '压抑'];
  indexTableData.value = indexNames.map((name, index) => ({
    index,
    name,
    groupRange: '暂无',
    score: '暂无',
    result: '暂无',
    selfRange: '-',
    deviation: '-',
    key: ['aggression', 'stress', 'tension', 'fatigue', 'charm', 'energy', 'regulation', 'depression'][index],
  }));
};

// 加载任务列表（对应HTML的getTaskList，行546-564）
const loadTaskList = async () => {
  try {
    const taskResRaw: any = await getTaskList(formState.pidcard);
    console.log('任务列表API返回：', taskResRaw);
    
    // 处理API返回的数据格式
    let taskRes: any = taskResRaw;
    if (taskResRaw && typeof taskResRaw === 'object' && !Array.isArray(taskResRaw)) {
      // 可能是axios响应对象 {data: [...]} 或包装对象 {result: [...]}
      taskRes = taskResRaw.data || taskResRaw.result || taskResRaw;
      // 如果仍然是对象，尝试获取数组
      if (taskRes && typeof taskRes === 'object' && !Array.isArray(taskRes)) {
        taskRes = taskRes.data || taskRes.result || [taskRes];
      }
    }
    
    console.log('处理后的任务列表：', taskRes);
    
    if (Array.isArray(taskRes) && taskRes.length > 0) {
      taskOptions.value = taskRes.map((item: any) => ({
        testNumber: item.testNumber || '',
        testNumberName: item.testNumberName || '',
      }));
    } else {
      taskOptions.value = [];
      console.warn('任务列表为空或格式不正确');
    }
  } catch (error) {
    console.error('加载任务列表失败：', error);
    // 不显示错误提示，因为筛选功能已被隐藏
  }
};

// 加载初始数据（根据HTML逻辑实现）- 对应HTML的window.onload（行458-479）
const loadInitialData = async () => {
  if (!formState.pidcard) {
    createMessage.warning('缺少必要参数');
    return;
  }

  createMessage.info('正在加载数据...');
  try {
    // 0. 立即调用：加载任务列表（对应HTML的getTaskList，行546-564）
    // 虽然筛选功能被隐藏，但保持与HTML版本的一致性
    loadTaskList();
    
    // 1. 立即调用：加载个人数据（对应HTML的getSelfRage，行1163-1454）
    await loadPersonalData();
    
    // 2. 立即调用：初始化表格2（对应HTML的creatChart2，行1507-1648）
    initIndexTable();
    
    // 3. 延迟300ms：加载群体建模范围（对应HTML的setTimeout(getPeopleRage, 300)，行470）
    setTimeout(async () => {
      try {
        await loadGroupRange();
      } catch (error) {
        console.error('加载群体建模范围失败：', error);
      }
    }, 300);
    
    // 4. 延迟300ms：加载跟踪数据（对应HTML的setTimeout(getTrackingIndex, 300)，行476）
    setTimeout(async () => {
      try {
        await loadTrackingData();
      } catch (error) {
        console.error('加载跟踪数据失败：', error);
      }
    }, 300);
    
    // 5. 延迟500ms：加载初始的具体指标数据（对应HTML的setTimeout(getResult, 500)，行472）
    // 对应HTML中getResult无参数调用会调用getMentalStateByPidcard（行1736）
    setTimeout(async () => {
      try {
        await loadInitialMentalState();
      } catch (error) {
        console.error('加载初始心理测评值失败：', error);
      }
    }, 500);

    // 延迟显示图表（对应HTML的DOMContentLoaded延迟1秒，行488-492）
    // 注意：图表初始化是异步的，需要在initChart中处理渲染逻辑
    setTimeout(() => {
      if (hasData.value && chartInitialized.value && myChart) {
        handleIndexClick('trackingIndex');
      } else {
        console.log('等待图表初始化... hasData:', hasData.value, 'chartInitialized:', chartInitialized.value, 'myChart:', !!myChart);
      }
    }, 1000);

    createMessage.success('数据加载完成');
  } catch (error) {
    console.error('数据加载失败：', error);
    createMessage.error('数据加载失败，请检查网络或联系管理员');
  }
};

// 加载个人数据
const loadPersonalData = async () => {
  try {
    // 对应HTML行1166：testNumber默认为空字符串，startDate和endDate为'null'
    const personalResRaw: any = await getPersonalData(formState.pidcard, {
      testNumber: '',  // HTML中testNumber为空字符串（对应HTML行1166）
      startDate: null,
      endDate: null,
    });

    console.log('个人数据API返回：', personalResRaw);
    
    // 处理API返回的数据格式（可能是数组，也可能是 { result: [...] } 或 { data: [...] }）
    let personalRes: any = personalResRaw;
    if (personalResRaw && typeof personalResRaw === 'object' && !Array.isArray(personalResRaw)) {
      // 如果是axios响应对象，优先使用data字段
      if (personalResRaw.data !== undefined) {
        personalRes = personalResRaw.data;
      } else if (personalResRaw.result !== undefined) {
        personalRes = personalResRaw.result;
      } else {
        personalRes = personalResRaw;
      }
      
      // 如果提取出的仍然是对象但不是数组，尝试进一步提取
      if (personalRes && typeof personalRes === 'object' && !Array.isArray(personalRes)) {
        personalRes = personalRes.data || personalRes.result || personalRes.list || [personalRes];
      }
    }

    console.log('处理后的个人数据：', personalRes);
    console.log('个人数据类型：', typeof personalRes, '是否为数组：', Array.isArray(personalRes), '长度：', Array.isArray(personalRes) ? personalRes.length : 'N/A');

    if (!Array.isArray(personalRes)) {
      console.warn('个人数据格式不正确，期望数组但得到：', typeof personalRes, personalRes);
      hasData.value = false;
      dataLength.value = 0;
      resultTableData.value = [];
      createMessage.warning('个人数据格式不正确');
      return;
    }

    if (personalRes.length === 0) {
      console.warn('个人数据为空数组，可能该用户没有相关记录');
      hasData.value = false;
      dataLength.value = 0;
      resultTableData.value = [];
      createMessage.warning('未找到个人数据记录');
      return;
    }

    dataLength.value = personalRes.length;
    hasData.value = personalRes.length > 0;

    // 保存videoId（最后一条数据的videoId）
    if (personalRes.length > 0) {
      videoId.value = personalRes[personalRes.length - 1].videoId || '';
    }

    // 处理前10条指标数据用于图表
    const limit = Math.min(10, personalRes.length);
    indexData.aggression10 = [];
    indexData.stress10 = [];
    indexData.tension10 = [];
    indexData.fatigue10 = [];
    indexData.charm10 = [];
    indexData.energy10 = [];
    indexData.regulation10 = [];
    indexData.depressionRage10 = [];

    // 为所有指标生成时间轴标签（如果times.value为空，则生成默认标签）
    if (times.value.length === 0) {
      times.value = personalRes.slice(0, limit).map((_: any, i: number) => `第${i + 1}次`);
    }

    for (let j = 0; j < limit; j++) {
      indexData.aggression10.push(personalRes[j].aggressionM || 0);
      indexData.stress10.push(personalRes[j].stressM || 0);
      indexData.tension10.push(personalRes[j].tensionM || 0);
      indexData.fatigue10.push(personalRes[j].fatigue || 0);
      indexData.charm10.push(personalRes[j].charmM || 0);
      indexData.energy10.push(personalRes[j].energyM || 0);
      indexData.regulation10.push(personalRes[j].regulationM || 0);
      indexData.depressionRage10.push(personalRes[j].depressionM || 0);
    }

    // 计算Y轴范围
    if (indexData.aggression10.length > 0) {
      axisRanges.minaggression10 = Math.min(...indexData.aggression10) - 5;
      const maxaggression10 = Math.max(...indexData.aggression10);
      axisRanges['yAxisaggression10' as any] = maxaggression10 + 5;
    }
    if (indexData.stress10.length > 0) {
      axisRanges.minstress10 = Math.min(...indexData.stress10) - 5;
      const maxstress10 = Math.max(...indexData.stress10);
      axisRanges['yAxisstress10' as any] = maxstress10 + 5;
    }
    if (indexData.tension10.length > 0) {
      axisRanges.mintension10 = Math.min(...indexData.tension10) - 5;
      const maxtension10 = Math.max(...indexData.tension10);
      axisRanges['yAxistension10' as any] = maxtension10 + 5;
    }
    if (indexData.fatigue10.length > 0) {
      axisRanges.minfatigue10 = Math.min(...indexData.fatigue10) - 5;
      const maxfatigue10 = Math.max(...indexData.fatigue10);
      axisRanges['yAxisfatigue10' as any] = maxfatigue10 + 5;
    }
    if (indexData.charm10.length > 0) {
      axisRanges.mincharm10 = Math.min(...indexData.charm10) - 5;
      const maxcharm10 = Math.max(...indexData.charm10);
      axisRanges['yAxischarm10' as any] = maxcharm10 + 5;
    }
    if (indexData.energy10.length > 0) {
      axisRanges.minenergy10 = Math.min(...indexData.energy10) - 5;
      const maxenergy10 = Math.max(...indexData.energy10);
      axisRanges['yAxisenergy10' as any] = maxenergy10 + 5;
    }
    if (indexData.regulation10.length > 0) {
      axisRanges.minregulation10 = Math.min(...indexData.regulation10) - 5;
      const maxregulation10 = Math.max(...indexData.regulation10);
      axisRanges['yAxisregulation10' as any] = maxregulation10 + 5;
    }
    if (indexData.depressionRage10.length > 0) {
      axisRanges.mindepressionRage10 = Math.min(...indexData.depressionRage10) - 5;
      const maxdepressionRage10 = Math.max(...indexData.depressionRage10);
      axisRanges['yAxisdepressionRage10' as any] = maxdepressionRage10 + 5;
    }

    // 处理表格数据（对应HTML的creatChart1）
    // 确保转换后的状态不被原始数据覆盖
    resultTableData.value = personalRes.map((item: any, index: number) => {
      // 先获取原始数据，然后转换状态字段
      const converted = {
        ...item,
        id: `row-${index}`,
        psychologyStatus: convertPsychologyStatus(item.psychologyStatus || 0),  // 确保总是转换，即使是0
        alarmStatus: convertAlarmStatus(item.alarmStatus || 0),  // 确保总是转换，即使是0
        psychologyStatusNum: item.psychologyStatus,
        alarmStatusNum: item.alarmStatus,
      };
      return converted;
    });

    // 更新综合结果（最后一条数据）- 对应HTML行1247-1454
    if (personalRes.length > 0) {
      const lastItem = personalRes[personalRes.length - 1];
      psychologyStatus.value = convertPsychologyStatus(lastItem.psychologyStatus);
      alarmStatus.value = convertAlarmStatus(lastItem.alarmStatus);
      
      // 加载指标说明和建议（对应HTML中getSelfRage成功后的逻辑，行1257-1450）
      // 确保在加载完个人数据后立即调用，对应HTML行1261-1450
      try {
        await loadSuggestionText(lastItem.psychologyStatus, lastItem.alarmStatus);
      } catch (error) {
        console.error('加载指标说明失败：', error);
      }
    }
    
    // 加载个体建模范围（对应HTML的getSelfInfoChart2，行1659-1719，在getSelfRage成功后调用）
    // 对应HTML中getSelfRage成功后没有立即调用，但在window.onload中会调用getSelfInfoChart2
    // 但为了确保数据完整性，我们在这里也调用
    try {
      await loadSelfRange();
    } catch (error) {
      console.error('加载个体建模范围失败：', error);
    }
  } catch (error) {
    console.error('加载个人数据失败：', error);
    throw error;
  }
};

// 加载初始的心理测评值（对应HTML的getResult无参数调用，会调用getMentalStateByPidcard，行1730-1753）
const loadInitialMentalState = async () => {
  try {
    // 确保群体建模范围已经加载完成 - 对应HTML中需要在getPeopleRage之后调用
    let retryCount = 0;
    while (groupRange1.value.length === 0 && retryCount < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retryCount++;
    }
    
    if (groupRange1.value.length === 0) {
      console.warn('群体建模范围未加载完成，无法更新具体指标数据');
      // 不返回，继续尝试加载心理测评值
    }
    
    const mentalResRaw: any = await getMentalStateByPidcard(formState.pidcard);
    console.log('心理测评值API返回：', mentalResRaw);
    
    // 处理API返回的数据格式 - HTML中直接使用dataForm[0]
    let mentalRes: any = mentalResRaw;
    if (mentalResRaw && typeof mentalResRaw === 'object' && !Array.isArray(mentalResRaw)) {
      // 可能是axios响应对象 {data: [...]} 或包装对象 {result: [...]}
      mentalRes = mentalResRaw.data || mentalResRaw.result || mentalResRaw;
      // 如果仍然是对象，尝试获取数组
      if (mentalRes && typeof mentalRes === 'object' && !Array.isArray(mentalRes)) {
        mentalRes = mentalRes.data || mentalRes.result || [mentalRes];
      }
    }
    
    console.log('处理后的心理测评值：', mentalRes);
    
    if (!Array.isArray(mentalRes) || mentalRes.length === 0) {
      console.warn('心理测评值为空或格式不正确');
      createMessage.warning('心理测评值加载失败');
      return;
    }
    
    const data = mentalRes[0];
    currentDetailData.value = data; // 保存当前详情数据，对应HTML行1747-1749
    
    // 更新具体指标数据（对应HTML的getMentalStateByPidcard函数，行1760-1995）
    if (groupRange1.value.length > 0 && groupRange2.value.length > 0) {
      updateIndexTableDataWithMentalState(data);
      
      // 生成雷达图（对应HTML行1787-1814）
      await generateRadarImages(data);
    } else {
      console.warn('群体建模范围未加载，延迟更新具体指标数据');
      // 等待群体建模范围加载完成后再次更新
      setTimeout(async () => {
        if (groupRange1.value.length > 0 && groupRange2.value.length > 0) {
          updateIndexTableDataWithMentalState(data);
          await generateRadarImages(data);
        }
      }, 500);
    }
  } catch (error) {
    console.error('加载初始心理测评值失败：', error);
    createMessage.error('加载心理测评值失败');
  }
};

// 使用心理测评值数据更新指标表格（对应HTML的getMentalStateByPidcard）
const updateIndexTableDataWithMentalState = (data: any) => {
  if (groupRange1.value.length === 0 || groupRange2.value.length === 0) {
    return;
  }

  // 顺序与雷达图一致：紧张、压力、焦虑、疲劳、平衡、能量、稳定、压抑
  const indexNames = ['紧张', '压力', '焦虑', '疲劳', '平衡', '能量', '稳定', '压抑'];
  const indexKeys = ['aggression', 'stress', 'tension', 'fatigue', 'charm', 'energy', 'regulation', 'depression'];
  // 对应groupRange1的索引映射（与雷达图的groupIndex一致）
  const groupIndexMap = [6, 7, 0, 1, 2, 3, 4, 5];
  
  indexTableData.value = indexNames.map((name, index) => {
    const key = indexKeys[index];
    const groupIdx = groupIndexMap[index]; // 使用映射索引
    const groupMin = groupRange1.value[groupIdx];
    const groupMax = groupRange2.value[groupIdx];
    const selfMin = modelStatus.value === 1 && selfRange1.value.length > groupIdx ? selfRange1.value[groupIdx] : null;
    const selfMax = modelStatus.value === 1 && selfRange2.value.length > groupIdx ? selfRange2.value[groupIdx] : null;
    
    let score = '-';
    let result = '-';
    
    // 获取心理测评值
    if (key === 'tension') score = (data.tensionM || 0).toFixed(1);
    else if (key === 'fatigue') score = (data.fatigue || 0).toFixed(1);
    else if (key === 'charm') score = (data.charmM || 0).toFixed(1);
    else if (key === 'energy') score = (data.energyM || 0).toFixed(1);
    else if (key === 'regulation') score = (data.regulationM || 0).toFixed(1);
    else if (key === 'depression') score = (data.depressionM || 0).toFixed(1);
    else if (key === 'aggression') score = (data.aggressionM || 0).toFixed(1);
    else if (key === 'stress') score = (data.stressM || 0).toFixed(1);
    
    // 计算判定结果（小于群体建模范围为低，在之间为正常，大于为高）
    const scoreNum = parseFloat(score);
    if (!isNaN(scoreNum)) {
      if (scoreNum < groupMin) {
        result = '低';
      } else if (scoreNum >= groupMin && scoreNum <= groupMax) {
        result = '正常';
      } else {
        result = '高';
      }
    }
    
    return {
      index,
      name,
      groupRange: `${(groupMin || 0).toFixed(1)}-${(groupMax || 0).toFixed(1)}`,
      score,
      result,
      selfRange: selfMin !== null && selfMax !== null ? `${selfMin.toFixed(1)}-${selfMax.toFixed(1)}` : '-',
      deviation: '-',
      key,
    };
  });
};

// 加载群体建模范围 - 对应HTML的getPeopleRage函数（行2361-2404）
const loadGroupRange = async () => {
  try {
    const groupResRaw: any = await getGroupRange();
    console.log('群体建模范围API返回：', groupResRaw);
    
    // 处理API返回的数据格式 - HTML中直接使用dataForm[0]
    let groupRes: any = groupResRaw;
    if (groupResRaw && typeof groupResRaw === 'object' && !Array.isArray(groupResRaw)) {
      // 可能是axios响应对象 {data: [...]} 或包装对象 {result: [...]}
      groupRes = groupResRaw.data || groupResRaw.result || groupResRaw;
      // 如果仍然是对象，尝试获取数组
      if (groupRes && typeof groupRes === 'object' && !Array.isArray(groupRes)) {
        groupRes = groupRes.data || groupRes.result || [groupRes];
      }
    }
    
    console.log('处理后的群体建模范围：', groupRes);
    
    if (!Array.isArray(groupRes) || groupRes.length === 0) {
      console.warn('群体建模范围为空或格式不正确');
      createMessage.warning('群体建模范围加载失败');
      return;
    }

    const data = groupRes[0];
    
    // 保存群体建模范围（按HTML顺序：tension, fatigue, charm, energy, regulation, depression, aggression, stress）
    // 对应HTML行2375-2393
    groupRange1.value = [
      data.tensionBmin || 0,
      data.fatigueBmin || 0,
      data.charmBmin || 0,
      data.energyBmin || 0,
      data.regulationBmin || 0,
      data.depressionBmin || 0,
      data.aggressionBmin || 0,
      data.stressBmin || 0,
    ];
    groupRange2.value = [
      data.tensionBmax || 0,
      data.fatigueBmax || 0,
      data.charmBmax || 0,
      data.energyBmax || 0,
      data.regulationBmax || 0,
      data.depressionBmax || 0,
      data.aggressionBmax || 0,
      data.stressBmax || 0,
    ];

    // 更新表格数据（对应HTML行2394-2401）- 更新群体建模范围显示
    updateIndexTableData();
    
    // 如果已经有心理测评值数据，需要更新表格
    if (currentDetailData.value) {
      updateIndexTableDataWithMentalState(currentDetailData.value);
      // 如果群体建模范围已加载，重新生成雷达图
      if (groupRange1.value.length > 0 && groupRange2.value.length > 0) {
        generateRadarImages(currentDetailData.value);
      }
    }
  } catch (error) {
    console.error('加载群体建模范围失败：', error);
    createMessage.error('加载群体建模范围失败');
  }
};

// 加载个体建模范围 - 对应HTML的getSelfInfoChart2函数（行1659-1719）
const loadSelfRange = async () => {
  try {
    const selfResRaw: any = await getSelfRange(formState.pidcard);
    console.log('个体建模范围API返回：', selfResRaw);
    
    // 处理API返回的数据格式 - HTML中直接使用dataForm[0]
    let selfRes: any = selfResRaw;
    if (selfResRaw && typeof selfResRaw === 'object' && !Array.isArray(selfResRaw)) {
      // 可能是axios响应对象 {data: [...]} 或包装对象 {result: [...]}
      selfRes = selfResRaw.data || selfResRaw.result || selfResRaw;
      // 如果仍然是对象，尝试获取数组
      if (selfRes && typeof selfRes === 'object' && !Array.isArray(selfRes)) {
        selfRes = selfRes.data || selfRes.result || [selfRes];
      }
    }
    
    console.log('处理后的个体建模范围：', selfRes);
    
    if (!Array.isArray(selfRes) || selfRes.length === 0) {
      console.warn('个体建模范围为空或格式不正确');
      createMessage.warning('个体建模范围加载失败');
      return;
    }

    const data = selfRes[0];
    modelStatus.value = data.modelingStatus || 0; // 对应HTML行1672

    // 保存个体建模范围（按HTML顺序：tension, fatigue, charm, energy, regulation, depression, aggression, stress）
    // 对应HTML行1676-1693
    selfRange1.value = [
      data.tensionBmin || 0,
      data.fatigueBmin || 0,
      data.charmBmin || 0,
      data.energyBmin || 0,
      data.regulationBmin || 0,
      data.depressionBmin || 0,
      data.aggressionBmin || 0,
      data.stressBmin || 0,
    ];
    selfRange2.value = [
      data.tensionBmax || 0,
      data.fatigueBmax || 0,
      data.charmBmax || 0,
      data.energyBmax || 0,
      data.regulationBmax || 0,
      data.depressionBmax || 0,
      data.aggressionBmax || 0,
      data.stressBmax || 0,
    ];

    // 更新表格数据 - 对应HTML行1697-1715（根据modelStatus判断是否显示）
    updateIndexTableData();
    
    console.log('个体建模范围加载完成，modelStatus:', modelStatus.value);
  } catch (error) {
    console.error('加载个体建模范围失败：', error);
    createMessage.error('加载个体建模范围失败');
  }
};

// 加载跟踪数据 - 对应HTML的getTrackingIndex函数（行2437-2457）
const loadTrackingData = async () => {
  try {
    const trackingResRaw: any = await getTrackingData(formState.pidcard);
    console.log('跟踪数据API返回：', trackingResRaw);
    
    // 处理API返回的数据格式 - HTML中直接使用dataForm
    let trackingRes: any = trackingResRaw;
    if (trackingResRaw && typeof trackingResRaw === 'object' && !Array.isArray(trackingResRaw)) {
      // 可能是axios响应对象 {data: [...]} 或包装对象 {result: [...]}
      trackingRes = trackingResRaw.data || trackingResRaw.result || trackingResRaw;
      // 如果仍然是对象，尝试获取数组
      if (trackingRes && typeof trackingRes === 'object' && !Array.isArray(trackingRes)) {
        trackingRes = trackingRes.data || trackingRes.result || [trackingRes];
      }
    }
    
    console.log('处理后的跟踪数据：', trackingRes);
    
    if (!Array.isArray(trackingRes) || trackingRes.length === 0) {
      console.warn('跟踪数据为空或格式不正确');
      times.value = [];
      indexData.trackingIndexData10 = [];
      createMessage.warning('跟踪数据加载失败');
      return;
    }

    // 对应HTML行2448-2454：如果数据少于10条，使用全部；否则只取前10条
    trackingRes = trackingRes.map((item: any) => {
      // 如果item是对象，尝试提取数值；如果是数字，直接使用
      return typeof item === 'number' ? item : (item.value || item.trackingIndex || item || 0);
    });

    if (trackingRes.length < 10) {
      indexData.trackingIndexData10 = [...trackingRes]; // 使用展开运算符创建新数组
      times.value = trackingRes.map((_: any, i: number) => `第${i + 1}次`);
    } else {
      indexData.trackingIndexData10 = [...trackingRes.slice(0, 10)]; // 使用展开运算符创建新数组
      times.value = Array.from({ length: 10 }, (_, i) => `第${i + 1}次`);
    }

    // 计算Y轴最小值 - 对应HTML行2453
    if (indexData.trackingIndexData10.length > 0) {
      axisRanges.mintrackingIndexData10 = Math.min(...indexData.trackingIndexData10) - 5;
    }
    
    console.log('跟踪数据加载完成，共', trackingRes.length, '条，填充到indexData.trackingIndexData10：', indexData.trackingIndexData10);
    
    // 如果图表已初始化且当前激活的是跟踪指标，重新渲染图表
    if (chartInitialized.value && myChart && activeIndex.value === 'trackingIndex') {
      console.log('跟踪数据加载完成，重新渲染图表');
      handleIndexClick('trackingIndex');
    }
  } catch (error) {
    console.error('加载跟踪数据失败：', error);
    createMessage.error('加载跟踪数据失败');
  }
};

// 更新指标表格数据
const updateIndexTableData = () => {
  if (groupRange1.value.length === 0 || groupRange2.value.length === 0) {
    return;
  }

  // 顺序与雷达图一致：紧张、压力、焦虑、疲劳、平衡、能量、稳定、压抑
  const indexNames = ['紧张', '压力', '焦虑', '疲劳', '平衡', '能量', '稳定', '压抑'];
  const indexKeys = ['aggression', 'stress', 'tension', 'fatigue', 'charm', 'energy', 'regulation', 'depression'];
  // 对应groupRange1的索引映射（与雷达图的groupIndex一致）
  const groupIndexMap = [6, 7, 0, 1, 2, 3, 4, 5];
  
  // 如果有当前选中的详情数据，使用它；否则使用最后一条数据
  const currentDetail = currentDetailData.value;
  
  indexTableData.value = indexNames.map((name, index) => {
    const key = indexKeys[index];
    const groupIdx = groupIndexMap[index]; // 使用映射索引
    const groupMin = groupRange1.value[groupIdx];
    const groupMax = groupRange2.value[groupIdx];
    const selfMin = modelStatus.value === 1 && selfRange1.value.length > groupIdx ? selfRange1.value[groupIdx] : null;
    const selfMax = modelStatus.value === 1 && selfRange2.value.length > groupIdx ? selfRange2.value[groupIdx] : null;
    
    let score = '-';
    let result = '-';
    
    if (currentDetail) {
      if (key === 'tension') score = (currentDetail.tensionM || 0).toFixed(1);
      else if (key === 'fatigue') score = (currentDetail.fatigue || 0).toFixed(1);
      else if (key === 'charm') score = (currentDetail.charmM || 0).toFixed(1);
      else if (key === 'energy') score = (currentDetail.energyM || 0).toFixed(1);
      else if (key === 'regulation') score = (currentDetail.regulationM || 0).toFixed(1);
      else if (key === 'depression') score = (currentDetail.depressionM || 0).toFixed(1);
      else if (key === 'aggression') score = (currentDetail.aggressionM || 0).toFixed(1);
      else if (key === 'stress') score = (currentDetail.stressM || 0).toFixed(1);
      
      // 计算判定结果
      const scoreNum = parseFloat(score);
      if (!isNaN(scoreNum)) {
        if (scoreNum < groupMin) {
          result = '低';
        } else if (scoreNum >= groupMin && scoreNum <= groupMax) {
          result = '正常';
        } else {
          result = '高';
        }
      }
    }
    
    return {
      name,
      groupRange: `${(groupMin || 0).toFixed(1)}-${(groupMax || 0).toFixed(1)}`,
      score,
      result,
      selfRange: selfMin !== null && selfMax !== null ? `${selfMin.toFixed(1)}-${selfMax.toFixed(1)}` : '-',
      deviation: '-',
      key,
    };
  });
};

// 当前选中的详情数据
const currentDetailData = ref<any>(null);

// 加载详细信息（点击详情按钮或初始化时调用）
const loadDetailData = async (record: any) => {
  try {
    currentDetailData.value = record;
    
    // 更新综合结果
    if (record.psychologyStatusNum !== undefined) {
      psychologyStatus.value = convertPsychologyStatus(record.psychologyStatusNum);
    }
    if (record.alarmStatusNum !== undefined) {
      alarmStatus.value = convertAlarmStatus(record.alarmStatusNum);
    }
    
    // 更新videoId
    if (record.videoId) {
      videoId.value = record.videoId;
    }
    
    // 加载指标说明和建议
    if (record.psychologyStatusNum !== undefined && record.alarmStatusNum !== undefined) {
      await loadSuggestionText(record.psychologyStatusNum, record.alarmStatusNum);
    }
    
    // 更新指标表格数据
    updateIndexTableData();
    
    // 生成雷达图
    await generateRadarImages(record);
  } catch (error) {
    console.error('加载详细信息失败：', error);
  }
};

// 加载指标说明和建议
const loadSuggestionText = async (psychologyStatusNum: number, alarmStatusNum: number) => {
  try {
    // 第一个建议（基于心理状态）- 对应HTML行1266-1279
    let intResult = psychologyStatusNum;
    if (psychologyStatusNum === 0) intResult = 0;
    else if (psychologyStatusNum === 1) intResult = 1;
    else if (psychologyStatusNum === 2) intResult = 2;
    
    const res1Raw: any = await getSuggestionText(intResult);
    console.log('getSuggestionText响应：', res1Raw);
    // HTML中直接使用response作为文本，可能是字符串或响应对象
    let res1 = '';
    if (typeof res1Raw === 'string') {
      res1 = res1Raw;
    } else if (res1Raw && typeof res1Raw === 'object') {
      // 可能是axios响应对象或包装对象
      res1 = res1Raw.data || res1Raw.result || res1Raw.text || res1Raw || '';
      if (typeof res1 !== 'string') {
        res1 = String(res1);
      }
    }
    annotationType.value = res1;
    
    // 第二个建议（基于跟踪状态）- 对应HTML行1329-1346
    let intResult1 = 3;
    if (alarmStatusNum === 0) intResult1 = 3; // 未跟踪
    else if (alarmStatusNum === 1) intResult1 = 0; // 正常
    else if (alarmStatusNum === 2) intResult1 = 1; // 一般
    else if (alarmStatusNum === 3) intResult1 = 2; // 关注
    
    // HTML中无论alarmStatusNum是否为0，都会调用suggestion2（对应getSuggestionText2）
    // 对应HTML行1313-1317：即使alarmStatusNum === 0，也会调用suggestion2(3)
    const res2Raw: any = await getSuggestionText2(intResult1);
    console.log('getSuggestionText2响应：', res2Raw);
    let res2 = '';
    if (typeof res2Raw === 'string') {
      res2 = res2Raw;
    } else if (res2Raw && typeof res2Raw === 'object') {
      res2 = res2Raw.data || res2Raw.result || res2Raw.text || res2Raw || '';
      if (typeof res2 !== 'string') {
        res2 = String(res2);
      }
    }
    // HTML行1316：当alarmStatusNum === 0时，设置annotation.innerHTML = ""（空字符串）
    if (alarmStatusNum === 0) {
      annotation.value = '';
    } else {
      annotation.value = res2;
    }
    
    // 第三个建议（综合）- 对应HTML行1383-1450
    let intResult2 = 9;
    if (psychologyStatusNum === 0 && alarmStatusNum === 1) intResult2 = 0;
    else if (psychologyStatusNum === 0 && alarmStatusNum === 2) intResult2 = 1;
    else if (psychologyStatusNum === 0 && alarmStatusNum === 3) intResult2 = 2;
    else if (psychologyStatusNum === 1 && alarmStatusNum === 1) intResult2 = 3;
    else if (psychologyStatusNum === 1 && alarmStatusNum === 2) intResult2 = 4;
    else if (psychologyStatusNum === 1 && alarmStatusNum === 3) intResult2 = 5;
    else if (psychologyStatusNum === 2 && alarmStatusNum === 1) intResult2 = 6;
    else if (psychologyStatusNum === 2 && alarmStatusNum === 2) intResult2 = 7;
    else if (psychologyStatusNum === 2 && alarmStatusNum === 3) intResult2 = 8;
    else if (alarmStatusNum === 0) {
      intResult2 = 9;
    }
    
    const res3Raw: any = await getSuggestionText3(intResult2);
    console.log('getSuggestionText3响应：', res3Raw);
    let res3 = '';
    if (typeof res3Raw === 'string') {
      res3 = res3Raw;
    } else if (res3Raw && typeof res3Raw === 'object') {
      res3 = res3Raw.data || res3Raw.result || res3Raw.text || res3Raw || '';
      if (typeof res3 !== 'string') {
        res3 = String(res3);
      }
    }
    annotationSum.value = res3;
  } catch (error) {
    console.error('加载指标说明失败：', error);
    createMessage.error('加载指标说明失败');
  }
};

// 生成雷达图 - 对应HTML的generateImages函数（行2591-2611）
const generateRadarImages = async (data: any) => {
  try {
    // 检查群体建模范围是否已加载
    if (groupRange1.value.length === 0 || groupRange2.value.length === 0) {
      console.warn('群体建模范围未加载，无法生成雷达图');
      return;
    }
    
    const radarLabels = ['紧张', '压力', '焦虑', '疲劳', '平衡', '能量', '稳定', '压抑'];
    const radarKeys = ['aggression', 'stress', 'tension', 'fatigue', 'charm', 'energy', 'regulation', 'depression'];
    const groupIndex = [6, 7, 0, 1, 2, 3, 4, 5]; // 对应groupRange1的索引，对应HTML行1789-1812的映射
    
    radarImages.value = [];
    
    for (let i = 0; i < 8; i++) {
      const key = radarKeys[i];
      const groupIdx = groupIndex[i];
      let value = 0;
      
      // 获取对应的值 - 对应HTML行1789-1812
      if (key === 'tension') value = data.tensionM || 0;
      else if (key === 'fatigue') value = data.fatigue || 0;
      else if (key === 'charm') value = data.charmM || 0;
      else if (key === 'energy') value = data.energyM || 0;
      else if (key === 'regulation') value = data.regulationM || 0;
      else if (key === 'depression') value = data.depressionM || 0;
      else if (key === 'aggression') value = data.aggressionM || 0;
      else if (key === 'stress') value = data.stressM || 0;
      
      if (groupRange1.value.length > groupIdx && groupRange2.value.length > groupIdx) {
        const min = groupRange1.value[groupIdx];
        const max = groupRange2.value[groupIdx];
        
        try {
          // 调用fenweitu接口生成雷达图 - 对应HTML行2593-2610
          const imageResRaw: any = await generateRadarImage(min, max, value);
          console.log(`生成${radarLabels[i]}雷达图API返回：`, imageResRaw);
          console.log(`生成${radarLabels[i]}雷达图API返回类型：`, typeof imageResRaw);
          if (imageResRaw && typeof imageResRaw === 'object') {
            console.log(`生成${radarLabels[i]}雷达图API返回的键：`, Object.keys(imageResRaw));
            if (imageResRaw.data) {
              console.log(`生成${radarLabels[i]}雷达图API返回data类型：`, typeof imageResRaw.data);
              if (imageResRaw.data && typeof imageResRaw.data === 'object') {
                console.log(`生成${radarLabels[i]}雷达图API返回data的键：`, Object.keys(imageResRaw.data));
              }
            }
          }
          
          // HTML中直接使用response作为base64字符串，然后添加前缀
          // document.getElementById(image).src = "data:image/jpeg;base64," + response;
          let base64String = '';
          
          // 递归函数：从对象中提取base64字符串
          const extractBase64 = (obj: any, depth = 0, path = ''): string => {
            if (depth > 5) {
              console.warn(`生成${radarLabels[i]}雷达图：递归深度超过限制，路径：${path}`);
              return ''; // 防止无限递归
            }
            
            if (typeof obj === 'string') {
              // 如果是字符串，验证是否是有效的base64（基本检查）
              if (obj.length > 10 && /^[A-Za-z0-9+/=]+$/.test(obj.replace(/data:image[^;]*;base64,/, ''))) {
                console.log(`生成${radarLabels[i]}雷达图：在路径${path}找到base64字符串，长度：${obj.length}`);
                return obj;
              }
            }
            
            if (obj && typeof obj === 'object') {
              // 如果是对象，尝试从多个可能的字段中提取
              const possibleFields = ['data', 'result', 'base64', 'image', 'content', 'body', 'value', 'base64String', 'imageData'];
              for (const field of possibleFields) {
                if (obj[field] !== undefined && obj[field] !== null) {
                  const extracted = extractBase64(obj[field], depth + 1, `${path}.${field}`);
                  if (extracted) return extracted;
                }
              }
              
              // 如果是数组，尝试第一个元素
              if (Array.isArray(obj) && obj.length > 0) {
                const extracted = extractBase64(obj[0], depth + 1, `${path}[0]`);
                if (extracted) return extracted;
              }
            }
            
            return '';
          };
          
          if (typeof imageResRaw === 'string') {
            // 直接是字符串，可能是base64，也可能已经包含data:前缀
            base64String = imageResRaw;
            console.log(`生成${radarLabels[i]}雷达图：直接获取到字符串，长度：${base64String.length}`);
          } else if (imageResRaw && typeof imageResRaw === 'object') {
            // 使用递归函数提取base64字符串
            base64String = extractBase64(imageResRaw, 0, 'root');
            
            // 如果提取失败，尝试直接访问常见的数据路径
            if (!base64String) {
              // 尝试多种可能的数据路径
              const paths = [
                imageResRaw.data?.data,
                imageResRaw.data?.result,
                imageResRaw.data?.base64,
                imageResRaw.result?.data,
                imageResRaw.result?.result,
                imageResRaw.base64,
                imageResRaw.image,
                imageResRaw.data,
                imageResRaw.result
              ];
              
              for (const path of paths) {
                if (typeof path === 'string' && path.length > 10) {
                  base64String = path;
                  console.log(`生成${radarLabels[i]}雷达图：从路径中找到base64字符串，长度：${base64String.length}`);
                  break;
                } else if (path && typeof path === 'object') {
                  const extracted = extractBase64(path, 0, 'nested');
                  if (extracted) {
                    base64String = extracted;
                    console.log(`生成${radarLabels[i]}雷达图：从嵌套对象中提取到base64字符串，长度：${base64String.length}`);
                    break;
                  }
                }
              }
            }
            
            if (!base64String) {
              console.error(`生成${radarLabels[i]}雷达图：无法从响应中提取base64字符串`, {
                raw: imageResRaw,
                type: typeof imageResRaw,
                keys: imageResRaw ? Object.keys(imageResRaw) : [],
                stringified: JSON.stringify(imageResRaw).substring(0, 200)
              });
              continue;
            }
          } else {
            console.warn(`生成${radarLabels[i]}雷达图：返回格式不正确：`, imageResRaw);
            continue;
          }
          
          // 处理base64字符串，确保格式正确
          let imageUrl = '';
          if (base64String) {
            // 验证base64字符串是否有效（基本检查）
            if (base64String.length < 10) {
              console.warn(`生成${radarLabels[i]}雷达图：base64字符串太短`, base64String);
              continue;
            }
            
            // 移除可能已存在的data:前缀
            if (base64String.startsWith('data:image')) {
              imageUrl = base64String;
            } else if (base64String.startsWith('data:')) {
              // 如果有其他data:前缀，替换为正确的格式
              imageUrl = `data:image/jpeg;base64,${base64String.replace(/^data:[^;]*;base64,/, '')}`;
            } else {
              // 直接添加前缀
              imageUrl = `data:image/jpeg;base64,${base64String}`;
            }
            
            // 验证最终的imageUrl格式
            if (!imageUrl.startsWith('data:image/jpeg;base64,')) {
              console.warn(`生成${radarLabels[i]}雷达图：imageUrl格式不正确`, imageUrl);
              continue;
            }
            
            // 对应HTML中通过imageId设置src：myImage1-myImage8
            radarImages.value.push({
              label: radarLabels[i],
              url: imageUrl,
            });
            
            console.log(`生成${radarLabels[i]}雷达图成功，base64长度：${base64String.length}`);
          } else {
            console.warn(`生成${radarLabels[i]}雷达图：未能获取有效的base64数据`, imageResRaw);
          }
        } catch (error) {
          console.error(`生成${radarLabels[i]}雷达图失败：`, error);
          createMessage.error(`生成${radarLabels[i]}雷达图失败`);
        }
      } else {
        console.warn(`生成${radarLabels[i]}雷达图：群体建模范围索引${groupIdx}不存在`);
      }
    }
    
    console.log('所有雷达图生成完成，共', radarImages.value.length, '张');
  } catch (error) {
    console.error('生成雷达图失败：', error);
    createMessage.error('生成雷达图失败');
  }
};

// 处理指标按钮点击（对应HTML的showChart函数，行633-1115）
const handleIndexClick = (key: string) => {
  activeIndex.value = key;
  
  // 如果图表未初始化，尝试初始化（对应HTML中showChart每次都初始化）
  if (!myChart || !chartInitialized.value) {
    console.warn('图表未初始化，尝试初始化...');
    initChart();
    // 延迟重试
    setTimeout(() => {
      if (myChart && chartInitialized.value) {
        handleIndexClick(key);
      }
    }, 300);
    return;
  }

  // 对应HTML行638：如果dataLength === 0，显示"暂无数据！"
  if (dataLength.value === 0) {
    myChart.clear();
    myChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: [], name: getIndexName(key) }],
      graphic: {
        type: 'text', left: 'center', top: 'center',
        style: { text: '暂无数据！', fontSize: 30, color: '#999' }
      }
    });
    hasData.value = false;
    return;
  }

  // 获取对应的数据（对应HTML中showChart的switch case逻辑）
  // 注意：trackingIndex 的数据存储在 trackingIndexData10 中，其他指标存储在 ${key}10 中
  let targetData: number[] = [];
  if (key === 'trackingIndex') {
    targetData = indexData.trackingIndexData10;
  } else {
    // 其他指标：aggressionIndex -> aggression10, stressIndex -> stress10, 等等
    const dataKey = `${key.replace('Index', '')}10` as keyof typeof indexData;
    targetData = indexData[dataKey] as number[];
  }
  
  console.log(`准备渲染${key}图表，数据键：${key === 'trackingIndex' ? 'trackingIndexData10' : key.replace('Index', '') + '10'}，数据长度：`, targetData.length, 'X轴数据：', times.value.length, '实际数据：', targetData);
  
  if (!targetData || targetData.length === 0) {
    console.warn(`指标${key}的数据为空，targetData:`, targetData);
    myChart.clear();
    myChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: [], name: getIndexName(key) }],
      graphic: {
        type: 'text', left: 'center', top: 'center',
        style: { text: '暂无该指标数据', fontSize: 16, color: '#999' }
      }
    });
    hasData.value = false;
    return;
  }

  // 获取Y轴范围
  let minValue = 0;
  let maxValue = Math.max(...targetData) + 5;
  
  if (key === 'trackingIndex') {
    minValue = axisRanges.mintrackingIndexData10;
  } else {
    const minKey = `min${key}10` as keyof typeof axisRanges;
    const maxKey = `yAxis${key}10` as keyof typeof axisRanges;
    minValue = axisRanges[minKey] || 0;
    if (axisRanges[maxKey]) {
      maxValue = axisRanges[maxKey] as number;
    }
  }

  // 构建图表配置（对应HTML中showChart的option配置，行651-1111）
  const option: any = {
    // 对应HTML行655：xAxis配置
    xAxis: {
      type: 'category',
      data: times.value, // 对应HTML行657：data: times
      axisLabel: {
        color: 'white', // 对应HTML行659：color: 'white'
        fontSize: 12 // 对应HTML行660：fontSize: 12
      },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } }
    },
    // 对应HTML行663：yAxis配置
    yAxis: {
      type: 'value',
      axisLabel: {
        color: 'white', // 对应HTML行666：color: 'white'
        fontSize: 12 // 对应HTML行667：fontSize: 12
      },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      min: minValue, // 对应HTML行669：min: mintrackingIndexData10
      max: maxValue
    },
    // 对应HTML行672：color配置
    color: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#39949b' }, // 对应HTML行679：color: '#39949b'
        { offset: 1, color: '#9b3953' } // 对应HTML行681：color: '#9b3953'
      ],
      global: false // 对应HTML行683：global: false
    },
    // 对应HTML行685：series配置
    series: [
      {
        name: getIndexName(key), // 对应HTML行687：name: '跟踪状态'
        data: targetData, // 对应HTML行688：data: trackingIndexData10
        type: 'line', // 对应HTML行689：type: 'line'
        smooth: false, // HTML中没有smooth配置
        lineStyle: { width: 3 },
        label: {
          show: true, // 对应HTML行691：show: true
          position: 'top', // 对应HTML行692：position: "top"
          textStyle: {
            fontSize: 15, // 对应HTML行694：fontSize: 15
            textBorderColor: '#39949b', // 对应HTML行695：textBorderColor: ' #39949b'
            color: '#9afefe' // 对应HTML行696：color: '#9afefe'
          }
        }
      }
    ],
    // 添加tooltip配置（HTML中没有显式配置，使用默认）
    tooltip: {
      trigger: 'axis',
      textStyle: { color: '#fff' },
      backgroundColor: 'rgba(15, 66, 111, 0.8)'
    }
  };
  
  // 对应HTML行1114：myChart.setOption(option)
  try {
    myChart.setOption(option, true); // true表示不合并，完全替换
    hasData.value = true;
    console.log(`图表${key}渲染成功`);
  } catch (error) {
    console.error(`图表${key}渲染失败：`, error);
    createMessage.error(`图表渲染失败`);
  }
};

// 获取指标名称（无变更）
const getIndexName = (key: string) => {
  const nameMap: Record<string, string> = {
    trackingIndex: '跟踪状态',
    aggressionIndex: '紧张指数',
    stressIndex: '压力指数',
    tensionIndex: '焦虑指数',
    fatigueIndex: '疲劳指数',
    charmIndex: '平衡指数',
    energyIndex: '能量指数',
    regulationIndex: '稳定指数',
    depressionRageIndex: '压抑指数',
  };
  return nameMap[key] || `未知指标(${key})`;
};

// 处理表格行点击（无变更）
const handleRowClick = (record: ResultTableItem) => {
  console.log('选中行数据：', record);
};

// 处理详情点击
const handleDetailClick = async (record: ResultTableItem) => {
  await loadDetailData(record);
  createMessage.success(`已加载 ${record.testNumberName} 的详细状态`);
};

// 处理导出PDF
const handleExportPdf = async () => {
  if (!videoId.value) {
    createMessage.warning('缺少videoId，无法导出PDF');
    return;
  }

  if (exportLoading.value) {
    return;
  }

  exportLoading.value = true;
  exportButtonLabel.value = '正在导出...';
  createMessage.info('正在生成PDF...');
  try {
    const response: any = await exportPdf(videoId.value);
    const rawData = response?.data ?? response;
    let messageText = '';
    if (rawData instanceof Blob) {
      messageText = await rawData.text();
    } else if (typeof rawData === 'string') {
      messageText = rawData;
    } else if (rawData && typeof rawData === 'object') {
      messageText = rawData.message || rawData.msg || '';
    }

    if (!messageText) {
      messageText = 'PDF生成成功';
    }

    createMessage.success(messageText);
    exportButtonLabel.value = '导出成功';
    setTimeout(() => (exportButtonLabel.value = '导出本次报告'), 1200);
  } catch (error) {
    console.error('PDF导出失败：', error);
    createMessage.error('PDF导出失败，请检查网络或联系管理员');
    exportButtonLabel.value = '导出失败，请重试';
    setTimeout(() => (exportButtonLabel.value = '导出本次报告'), 1500);
  } finally {
    exportLoading.value = false;
  }
};

// 计算状态样式（无变更）
const psychologyStatusStyle = computed(() => {
  const colorMap = {
    正常: 'linear-gradient(to right, #39cddc, #5989e4)',
    一般: 'linear-gradient(to right, #f9d423, #ff4e50)',
    关注: 'linear-gradient(to right, #ff6b6b, #ee5253)',
    待评估: 'linear-gradient(to right, #999, #ccc)'
  };
  return { background: colorMap[psychologyStatus.value as keyof typeof colorMap] || colorMap.待评估, borderRadius: '4px' };
});

const alarmStatusStyle = computed(() => {
  const colorMap = {
    正常: 'linear-gradient(to right, #39cddc, #5989e4)', 
    关注: 'linear-gradient(to right, #f9d423, #ff4e50)',
    预警: 'linear-gradient(to right, #ff6b6b, #ee5253)',
    未跟踪: 'linear-gradient(to right, #39cddc, #5989e4)',  
    待跟踪: 'linear-gradient(to right, #999, #ccc)'
  };
  return { background: colorMap[alarmStatus.value as keyof typeof colorMap] || colorMap.待跟踪, borderRadius: '4px' };
});
</script>

<style scoped lang="scss">
$prefixCls: 'psychology-detail';

.#{$prefixCls} {
  width: 100%;
  height: 100vh;
  padding: 0; // 移除padding，对应HTML的无padding
  background: url('@jeesite/assets/images/win.png') no-repeat center center;
  background-size: cover;
  background-attachment: fixed; // 确保背景图固定
  color: rgba(255, 255, 255, 0.84);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  line-height: 1.15; // 对应HTML的line-height: 1.15

  // 顶部导出栏（对应HTML的height: 4vh）
  .export-bar {
    height: 4vh;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    text-align: center;
    margin-right: 35px; // 对应HTML的margin-right: 35px
    margin-bottom: 0;
    
    #downloadPDF {
      display: block;
      width: 12%; // 对应HTML的width: 12%
      height: 100%; // 对应HTML的height: 100%
      background-color: #4381b6; // 对应HTML的background-color: #4381b6
      color: white; // 对应HTML的color: white
      border: none;
      border-radius: 5px; // 对应HTML的border-radius: 5px
      cursor: pointer;
      font-size: 14px; // 对应HTML的font-size: 14px
      &:hover { opacity: 0.9; }
      &:active {
        transform: translateY(2px); // 对应HTML的button:active transform
      }
    }
  }

  // 布局容器（对应HTML的#layout-wrapper）
  .layout-wrapper {
    height: 94vh; // 对应HTML的height: 94vh
    width: 100%; // 对应HTML的width: 100%
  }

  // 左侧容器（对应HTML的.box1）
  .box1 {
    display: flex;
    flex-direction: column;
    width: 40%; // 对应HTML的width: 40%
    height: 100%; // 对应HTML的height: 100%
    float: left; // 对应HTML的float: left
    
    .left-card {
      margin: 5px; // 对应HTML的margin: 5px 5px 5px 5px
      background: transparent; // 背景透明，显示背景图
      border: none;
      box-shadow: 5px 5px 5px 5px #0f426f; // 对应HTML的box-shadow: 5px 5px 5px 5px #0f426f
      border-radius: 0;

      &.top-card {
        height: 50%;
        overflow: hidden;
      }

      &.bottom-card { 
        height: 50%; // 对应HTML的height: 50%
        display: flex; // 确保flex布局
        flex-direction: column; // 确保垂直布局
        overflow: hidden; // 防止内容溢出
      }

      .card-title {
        color: rgba(154, 254, 254, 0.89);
        font-size: 20px; // 对应HTML的h4 font-size: 20px
        margin-left: 20px; // 对应HTML的style="margin-left: 20px"
        margin-bottom: 0;
        padding-top: 0;
        border-bottom: none;
        padding-bottom: 0;
      }
    }

    // 个人信息区域（对应HTML的.leftTop和.leftButton）
    .personal-info {
      padding: 0;
      height: 100%;
      display: flex;
      flex-direction: column;

      .form-item {
        margin-bottom: 8px;
        :deep(.ant-form-item-label > label) {
          color: rgba(255, 255, 255, 0.84);
          font-size: 14px;
        }
        :deep(.ant-input) {
          background: rgba(255, 255, 255, 0.1);
          border-color: #494640;
          color: #d7e4ed;
          &:disabled {
            background: rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.6);
          }
        }
      }

      // 表格样式
      :deep(.ant-table) {
        background: transparent;
        .ant-table-thead > tr > th {
          background: rgba(15, 66, 111, 0.5);
          color: rgba(154, 254, 254, 0.89);
          border-bottom: 1px solid rgba(154, 254, 254, 0.2);
          padding: 4px 8px;
        }
        .ant-table-tbody > tr > td {
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          border-bottom: 1px solid rgba(154, 254, 254, 0.1);
          padding: 4px 8px;
          line-height: 18px;
        }
        .ant-table-tbody > tr:hover > td { background: rgba(154, 254, 254, 0.1); }
      }
    }

    .index-buttons {
      display: flex;
      flex-wrap: nowrap; // 对应HTML行341：flex布局，不换行
      padding: 8px;
      width: 100%; // 确保占据全宽
      // 对应HTML的.sub-box2-btn，height: 10%
      .ant-btn {
        flex: 1; // 对应HTML行342：style="flex: 1"，平均分配宽度
        min-width: 0; // 允许按钮缩小，避免换行
        margin: 0 4px; // 移除底部margin，避免换行
        background: transparent;
        border-color: #494640; // 对应HTML行81：border-color: #494640
        color: #d7e4ed; // 对应HTML行87：color: #d7e4ed
        white-space: nowrap; // 防止文字换行
        &:hover { border-color: #9afefe; color: #9afefe; }
        &.active {
          background: rgba(154, 254, 254, 0.2);
          border-color: #9afefe;
          color: #9afefe;
        }
      }
    }

    .chart-container {
      height: calc(100% - 48px); // 对应HTML的.sub-box2-div height: 89%
      position: relative;
      // 确保容器有明确的高度，避免尺寸为0
      min-height: 300px; // 添加最小高度，确保容器有尺寸
      flex: 1; // 使用flex布局，占据剩余空间
      display: flex; // 确保flex布局生效
      // 对应HTML的.sub-box2-div，确保图表容器有尺寸
      .echart-dom { 
        width: 100%; 
        height: 100%; 
        min-height: 300px; // 确保有最小高度，对应HTML行637：div.style.height = '100%'
        display: block; // 确保是块级元素
        flex: 1; // 使用flex布局
      }
      .no-data {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        font-size: 30px; // 对应HTML行642：fontSize: 30px
        color: #999;
        display: flex;
        justify-content: center; // 对应HTML行644：justifyContent: 'center'
        align-items: center; // 对应HTML行645：alignItems: 'center'
      }
    }
  }

  // 右侧容器（对应HTML的.box2）
  .box2 {
    display: flex;
    flex-direction: column;
    width: 58%; // 对应HTML的width: 58%
    height: 100%; // 对应HTML的height: 100%
    float: left; // 对应HTML的float: left

    .right-container {
      height: 100%; // 对应HTML的.right-box height: 100%
      margin: 5px; // 对应HTML的margin: 5px 5px 5px 5px
      box-shadow: 5px 5px 5px 5px #0f426f; // 对应HTML的box-shadow: 5px 5px 5px 5px #0f426f
      display: flex;
      flex-direction: column;
      background: transparent; // 背景透明，显示背景图

      // 右侧内容区域（对应HTML的.rightTop, .rightMid, .rightBtm）
      .rightTop {
        height: 25%; // 对应HTML的.rightTop height: 25%
        .card-title {
          color: rgba(154, 254, 254, 0.89);
          font-size: 20px; // 对应HTML的h4 font-size: 20px
          margin-left: 20px; // 对应HTML的style="margin-left: 20px"
          margin-bottom: 0;
          padding-top: 0;
          border-bottom: none;
          padding-bottom: 0;
        }
        .stat-card {
          width: 150px; 
          height: 70px;
          margin-bottom: 10px; // 对应HTML的margin-bottom: 10px
          display: flex; 
          align-items: center; 
          justify-content: center;
          border-radius: 0;
          box-shadow: none;
          flex-direction: row; // 对应HTML的flex-direction: row
        }
        .stat-value { 
          color: white; 
          font-size: 24px; // 对应HTML的h2
          font-weight: bold; 
          line-height: 70px; // 对应HTML的style="line-height: 70px"
        }
        h2 {
          font-size: 18px; // 对应HTML的h2
          color: rgba(255, 255, 255, 0.84);
          margin: 0;
        }
      }

      .rightMid {
        height: 25%; // 对应HTML的.rightMid height: 25%
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        padding-left: 20px;
        .card-title {
          color: rgba(154, 254, 254, 0.89);
          font-size: 20px; // 对应HTML的h4 font-size: 20px
          margin: 0 0 20px 0;
          padding: 0;
          border-bottom: none;
        }
        .suggestion-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .suggestion-item {
          margin-left: 10px; // 对应HTML的style="margin-left: 30px"
          line-height: 1.5; 
          color: rgba(255, 255, 255, 0.84); 
          font-size: 18px; // 对应HTML的h3 font-size: 18px
          margin-bottom: 0;
        }
      }

      .rightBtm {
        height: 55%; // 对应HTML的.rightBtm height: 50%
        margin-top: -20px; // 向上收紧与指标说明的间距
        .card-title {
          color: rgba(154, 254, 254, 0.89);
          font-size: 20px; // 对应HTML的h4 font-size: 20px
          margin-left: 20px; // 对应HTML的style="margin-left: 20px"
          margin-bottom: 0;
          padding-top: 0;
          border-bottom: none;
          padding-bottom: 0;
        }
      }

      // 图表区域（对应HTML的.chart，宽度60%，高度90%）
      .chart {
        flex-direction: column;
        display: flex;
        width: 55%; // 收缩表格宽度，为热力图留出空间
        height: 100%; // 对应HTML的height: 90%
        float: left; // 对应HTML的float: left
            .index-table {
            padding: 0;
            margin-left: 10px; // 对应HTML的margin-left: 10px
            height: 100%;
            overflow: hidden; // 不滚动
            :deep(.ant-table) {
              background: transparent;
              border: none; // 移除默认边框
              border-top: 2px solid #8ce7ed; // 对应HTML的border-top: 2px solid #8ce7ed
              border-bottom: 2px solid #8ce7ed; // 对应HTML的border-bottom: 2px solid #8ce7ed
              border-left: 2px solid #8ce7ed; // 左侧蓝色边框
              border-right: 2px solid #8ce7ed; // 右侧蓝色边框
              
              // 表格容器
              .ant-table-container {
                border: none;
              }
              
              // 表头样式（对应HTML行1513-1518）
              .ant-table-thead > tr > th {
                background: transparent; // 对应HTML：背景透明
                color: rgba(255, 255, 255, 0.84); // 对应HTML：白色文字
                border: none; // 移除默认边框
                border-bottom: 2px solid #8ce7ed; // 对应HTML行1513：border-bottom: 2px solid #8ce7ed
                border-right: 1px solid rgba(255, 255, 255, 0.3); // 添加列分隔线
                font-weight: bold; // 对应HTML行1513：font-weight: bold
                padding: 5px; // 对应HTML行160：padding: 5px
                font-size: 15px; // 对应HTML行160：font-size: 15px
                text-align: center; // 对应HTML行154：text-align: center
                
                &:last-child {
                  border-right: none; // 最后一列不加右边框
                }
              }
              
              // 表格体样式（对应HTML行1522-1591）
              .ant-table-tbody > tr > td {
                background: transparent; // 对应HTML：背景透明
                color: rgba(255, 255, 255, 0.84); // 对应HTML：白色文字
                border: none; // 移除默认边框
                border-bottom: 1px solid rgba(255, 255, 255, 0.3); // 行分隔线
                border-right: 1px solid rgba(255, 255, 255, 0.3); // 列分隔线
                padding: 5px; // 对应HTML行160：padding: 5px
                font-size: 15px; // 对应HTML行160：font-size: 15px
                text-align: center; // 对应HTML行154：text-align: center
                
                &:last-child {
                  border-right: none; // 最后一列不加右边框
                }
                
                // 第一列（项目列）左对齐（对应HTML）
                &:first-child {
                  text-align: left; // 项目列左对齐
                }
              }
              
              // 最后一行不加底部边框
              .ant-table-tbody > tr:last-child > td {
                border-bottom: none;
              }
              
              // 悬停效果（对应HTML：无悬停效果，保持透明）
              .ant-table-tbody > tr:hover > td { 
                background: transparent; 
              }
            }
        }
      }

      // 雷达图区域（对应HTML的.radarSide，宽度40%，高度90%）
      .radarSide {
        flex-direction: column;
        display: flex;
        width: 45%; // 加宽热力图区域
        flex: 1;
        height: 100%; // 对应HTML的height: 90%
        float: left; // 对应HTML的float: left
        margin-top: -2%; // 对应HTML的margin-top: -2%
        
        .radar-item.container {
          display: flex;
          align-items: center; // 对应HTML的align-items: center
          height: 11%; // 对应HTML的height: 14%
          width: 80%; // 确保容器占满宽度
          margin-left: 6%; // 减少左侧留白，让文字更靠近图像
          
          .radar-label { 
            font-size: 15px; // 对应HTML的font-size: 15px
            color: white; // 对应HTML的color: white
            margin-right: 4px; // 缩短文字和热力图的距离
            flex-shrink: 0; // 防止标签被压缩
          }
          .radar-img {
            flex: 1; // 让图片自动填充剩余空间
            width: auto; // 改为自动宽度，配合flex使用
            height: 100%; 
            border-radius: 0;
            background: transparent;
          }
        }
        .no-data { text-align: center; padding: 20px 0; color: #999; }
      }
    }
  }
}
</style>
