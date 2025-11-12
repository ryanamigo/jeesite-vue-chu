<template>
  <div :class="prefixCls" class="ksh">
    <!-- 加载动画 -->
    <div v-if="loading" id="load" class="load">
      <div class="load_img">
        <img class="jzxz1" :src="jzxz1Img" />
        <img class="jzxz2" :src="jzxz2Img" />
      </div>
    </div>

    <!-- 顶部区域 -->
    <div class="head_top">
      <!-- 时间筛选按钮 -->
      <div class="time_filtering">
        <button
          v-for="(btn, index) in timeButtons"
          :key="index"
          :class="['button', { selected: timeFilter === btn.value }]"
          @click="handleTimeFilter(btn.value)"
        >
          {{ btn.label }}
        </button>
      </div>
      <img class="img-responsive" :src="logoImg" />
      <div class="time_clock">
        <div class="date">
          <div class="week">
            <span class="wek">{{ currentWeek }}</span>
            <span class="day">{{ currentDate }}</span>
            <span class="time">{{ currentTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="visual">
      <!-- 左侧区域 -->
      <div class="visual_left">
        <!-- 近X月测试统计 -->
        <div class="visual_box">
          <div class="visual_title">
            <span>{{ testStatisticsTitle }}</span>
          </div>
          <div ref="chart2Ref" class="visual_chart" style="height: 100%"></div>
        </div>

        <!-- 部门统计 -->
        <div class="visual_box">
          <div class="visual_title">
            <span>部门统计</span>
          </div>
          <div ref="chart3Ref" class="visual_chart" style="height: 100%"></div>
        </div>

        <!-- 任务完成情况统计 -->
        <div class="visual_box">
          <div class="visual_title">
            <span>任务完成情况统计</span>
          </div>
          <div ref="chart9Ref" class="visual_chart" style="height: 90%"></div>
        </div>
      </div>

      <!-- 中间区域 -->
      <div class="visual_con">
        <!-- 顶部统计卡片 -->
        <div class="visual_conTop">
          <HeaderStatistics
            :title="'总人数'"
            :value="statistics.headcount || 0"
            :card-id="'headcount'"
            :jump-title="'总人数'"
            :background-image="titBgImg"
            @card-click="() => {}"
          />
          <HeaderStatistics
            :title="'总次数'"
            :value="statistics.totalTimes || 0"
            :card-id="'totalTimes'"
            :jump-title="'总次数'"
            :background-image="titBgImg"
            @card-click="() => {}"
          />
          <HeaderStatistics
            :title="'回访人数'"
            :value="statistics.returnVisitors || 0"
            :card-id="'returnVisitors'"
            :jump-title="'回访人数'"
            :background-image="titBgImg"
            @card-click="() => {}"
          />
          <HeaderStatistics
            :title="'建模人数'"
            :value="statistics.modelers || 0"
            :card-id="'modelers'"
            :jump-title="'建模人数'"
            :background-image="titBgImg"
            @card-click="() => {}"
          />
          <div class="clear"></div>
        </div>

        <!-- 底部区域 -->
        <div class="visual_conBot">
          <div class="visual_conBot_chart">
            <!-- 各类状态分布比例 -->
            <div class="visual_box">
              <div class="visual_title">
                <span>各类状态分布比例</span>
              </div>
              <div ref="chart4Ref" class="visual_chart"></div>
            </div>

            <!-- 近15天心理状态统计 -->
            <div class="visual_box">
              <div class="visual_title">
                <span>近15天心理状态统计</span>
              </div>
              <div ref="chart5Ref" class="visual_chart"></div>
            </div>
          </div>

          <!-- 近15天关注人员列表 -->
          <div class="visual_box tb_header" style="margin-bottom: 0rem">
            <div class="visual_title">
              <span>近15天关注人员列表</span>
            </div>
            <div class="visual_table">
              <div class="swiper-container visual_swiper2" id="rollLinkk">
                <div id="rollLinkk1">
                  <table style="width: 100%">
                    <thead>
                    <tr class="swiper_header">
                      <th>序号</th>
                      <th>姓名</th>
                      <th>部别</th>
                      <th>综合心理状态</th>
                      <th>跟踪预警状态</th>
                      <th>时间</th>
                    </tr>
                    </thead>
                    <tbody class="rollLink" style="color: aliceblue">
                      <tr
                        v-for="(item, index) in followedList"
                        :key="index"
                        :class="index % 2 === 0 ? 'evenrowcolor' : 'oddrowcolor'"
                      >
                        <td style="width: calc(100% / 6); text-align: center; margin: 0 3px">
                          {{ index + 1 }}
                        </td>
                        <td style="width: calc(100% / 6); text-align: center; margin: 0 3px">
                          {{ item.pname }}
                        </td>
                        <td style="width: calc(100% / 6); text-align: center; margin: 0 3px">
                          {{ item.ppositionName }}
                        </td>
                        <td style="width: calc(100% / 6); text-align: center; margin: 0 3px">
                          {{ convertPsychologyStatus(item.psychologyStatus) }}
                        </td>
                        <td style="width: calc(100% / 6); text-align: center; margin: 0 3px">
                          {{ convertAlarmStatus(item.alarmStatus) }}
                        </td>
                        <td style="width: calc(100% / 6); text-align: center; margin: 0 3px">
                          {{ item.createdAt }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="visual_right">
        <!-- 测试次数统计 -->
        <div class="visual_box">
          <div class="visual_title">
            <span>测试次数统计</span>
          </div>
          <div ref="chart1Ref" class="visual_chart"></div>
        </div>

        <!-- 近15天性别统计 -->
        <div class="visual_box">
          <div class="visual_title">
            <span>近15天性别统计</span>
          </div>
          <div style="display: flex; width: 100%; height: calc(100% - 0.5rem)">
            <div style="width: 50%; height: 100%">
              <div ref="chart7Ref" class="visual_chart" style="width: 100%; height: 100%"></div>
            </div>
            <div style="width: 50%; height: 100%">
              <div ref="chart71Ref" class="visual_chart" style="width: 100%; height: 100%"></div>
            </div>
          </div>
        </div>

        <!-- 年龄比例 -->
        <div class="visual_box">
          <div class="visual_title">
            <span>年龄比例</span>
          </div>
          <div ref="chart8Ref" class="visual_chart" style="width: 100%; height: 100%"></div>
        </div>
      </div>
      <div class="clear"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useECharts } from '@jeesite/core/hooks/web/useECharts';
import type { EChartsOption } from 'echarts';
import { useDesign } from '@jeesite/core/hooks/web/useDesign';
import {
  findFollowedInformation,
  countNumberByPsychology,
  findAllPeopleCount,
  findAllMidCount,
  findAnnotationByType,
  findModelingByType,
  countTestNumber,
  findTwelveTestingInformation,
  countPosition,
  findEmotionResultByEightIndicators,
  getPsychologyGroupByAge,
  countTest,
} from '@jeesite/core/api/screendisplay/screendisplay';

// 导入组件
import HeaderStatistics from '@jeesite/core/views/emotion/components/HeaderStatistics.vue';

// 导入图片资源
import jzxz1Img from '@jeesite/assets/images/screeninformation/jzxz1.png';
import jzxz2Img from '@jeesite/assets/images/screeninformation/jzxz2.png';
import logoImg from '@jeesite/assets/images/screeninformation/jcdsj_logo.png';
import titBgImg from '@jeesite/assets/images/img-北京/tit-01.png';
const { prefixCls } = useDesign('screendisplay');

// 图表引用
const chart1Ref = ref<HTMLDivElement>();
const chart2Ref = ref<HTMLDivElement>();
const chart3Ref = ref<HTMLDivElement>();
const chart4Ref = ref<HTMLDivElement>();
const chart5Ref = ref<HTMLDivElement>();
const chart7Ref = ref<HTMLDivElement>();
const chart71Ref = ref<HTMLDivElement>();
const chart8Ref = ref<HTMLDivElement>();
const chart9Ref = ref<HTMLDivElement>();

// 图表实例
const { setOptions: setChart1Options } = useECharts(chart1Ref as any);
const { setOptions: setChart2Options } = useECharts(chart2Ref as any);
const { setOptions: setChart3Options } = useECharts(chart3Ref as any);
const { setOptions: setChart4Options } = useECharts(chart4Ref as any);
const { setOptions: setChart5Options } = useECharts(chart5Ref as any);
const { setOptions: setChart7Options } = useECharts(chart7Ref as any);
const { setOptions: setChart71Options } = useECharts(chart71Ref as any);
const { setOptions: setChart8Options } = useECharts(chart8Ref as any);
const { setOptions: setChart9Options } = useECharts(chart9Ref as any);

// 状态
const loading = ref(true);
const timeFilter = ref(1); // 1: 近一月, 3: 近三月, 6: 近六月, 12: 近一年
const followedList = ref<any[]>([]);
const statistics = ref({
  headcount: 0,
  headcountToday: 0,
  headcountWeek: 0,
  totalTimes: 0,
  totalTimesToday: 0,
  totalTimesWeek: 0,
  returnVisitors: 0,
  returnVisitorsToday: 0,
  returnVisitorsWeek: 0,
  modelers: 0,
  modelersToday: 0,
  modelersWeek: 0,
});

// 时间显示
const currentWeek = ref('');
const currentDate = ref('');
const currentTime = ref('');

// 时间筛选按钮
const timeButtons = [
  { label: '近一月', value: 1 },
  { label: '近三月', value: 3 },
  { label: '近六月', value: 6 },
  { label: '近一年', value: 12 },
];

const testStatisticsTitle = computed(() => {
  const titles: Record<number, string> = {
    1: '近1月测试统计',
    3: '近3月测试统计',
    6: '近6月测试统计',
    12: '近12月测试统计',
  };
  return titles[timeFilter.value] || '近1月测试统计';
});

// 转换心理状态
const convertPsychologyStatus = (status: number) => {
  const map: Record<number, string> = {
    0: '正常',
    1: '一般',
    2: '关注',
  };
  return map[status] || '未知';
};

// 转换预警状态
const convertAlarmStatus = (status: number) => {
  const map: Record<number, string> = {
    0: '未跟踪',
    1: '正常',
    2: '一般',
    3: '关注',
  };
  return map[status] || '未知';
};

// 更新时间显示
const updateTime = () => {
  const now = new Date();
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  currentWeek.value = weekDays[now.getDay()];
  currentDate.value = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
};

let timeInterval: any = null;

// 初始化图表1 - 测试次数统计
const initChart1 = async () => {
  try {
    const response = await countTestNumber(timeFilter.value);
    const data = response.data || response;
    const legendData = Object.keys(data).map((name) => name + '次');
    const colors = ['#4CAF50', '#c8c533', '#f44336'];
    const seriesData = Object.entries(data).map(([name, value], index) => ({
      name: name + '次',
      value: Number(value),
      itemStyle: {
        color: colors[index % colors.length],
      },
    }));

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        type: 'scroll',
        left: 'right',
        top: 'top',
        data: legendData,
        textStyle: {
          color: 'white',
        },
        padding: [10, 0, 0, 0],
      },
      series: [
        {
          name: '测试次数统计',
          type: 'pie',
          radius: [30, 60],
          center: ['50%', '40%'],
          roseType: 'area',
          labelLine: {
            length: 15,
            lineStyle: {
              color: 'white',
            },
          },
          itemStyle: {
            borderRadius: 5,
          },
          data: seriesData,
        },
      ],
    };
    setChart1Options(option);
  } catch (error) {
    console.error('获取测试次数统计失败:', error);
  }
};

// 初始化图表2 - 近X月测试统计
const initChart2 = async () => {
  try {
    const response = await findTwelveTestingInformation(timeFilter.value);
    const data = response.data || response;
    let j = data.length - 1;
    const month: string[] = [];
    const commonlyCount: number[] = [];
    const concernCount: number[] = [];
    const normalCount: number[] = [];

    for (let i = 0; i < data.length; i++) {
      commonlyCount[j] = data[i].commonlyCount;
      concernCount[j] = data[i].concernCount;
      normalCount[j] = data[i].normalCount;
      month[j] = data[i].month;
      j--;
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        textStyle: {
          color: 'white',
        },
        left: 'right',
        top: 'top',
        padding: [10, 0, 0, 0],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: month,
          axisLine: {
            show: true,
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            show: true,
            color: 'white',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            show: true,
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            show: true,
            color: 'white',
          },
        },
      ],
      series: [
        {
          name: '正常',
          type: 'bar',
          itemStyle: {
            color: '#4CAF50',
          },
          stack: 'Ad',
          emphasis: {
            focus: 'series',
          },
          data: normalCount,
          barMaxWidth: 50,
        },
        {
          name: '一般',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#c8c533',
          },
          emphasis: {
            focus: 'series',
          },
          data: commonlyCount,
        },
        {
          name: '关注',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#f44336',
          },
          emphasis: {
            focus: 'series',
          },
          data: concernCount,
        },
      ],
    };
    setChart2Options(option);
  } catch (error) {
    console.error('获取近X月测试统计失败:', error);
  }
};

// 初始化图表3 - 部门统计
const initChart3 = async () => {
  try {
    const response = await countPosition(timeFilter.value);
    const data = response.data || response;
    const position: string[] = [];
    const mediumCount: number[] = [];
    const followCount: number[] = [];
    const normalCount: number[] = [];

    for (let i = 0; i < data.length; i++) {
      mediumCount[i] = data[i].mediumCount;
      followCount[i] = data[i].followCount;
      normalCount[i] = data[i].normalCount;
      position[i] = data[i].position;
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        textStyle: {
          color: 'white',
        },
        left: 'right',
        top: 'top',
        padding: [10, 0, 0, 0],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: position,
          axisLine: {
            show: true,
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            interval: 0,
            show: true,
            color: 'white',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            show: true,
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            show: true,
            color: 'white',
          },
        },
      ],
      series: [
        {
          name: '正常',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#4CAF50',
          },
          emphasis: {
            focus: 'series',
          },
          data: normalCount,
          barMaxWidth: 50,
        },
        {
          name: '一般',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#c8c533',
          },
          emphasis: {
            focus: 'series',
          },
          data: mediumCount,
        },
        {
          name: '关注',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#f44336',
          },
          emphasis: {
            focus: 'series',
          },
          data: followCount,
        },
      ],
    };
    setChart3Options(option);
  } catch (error) {
    console.error('获取部门统计失败:', error);
  }
};

// 初始化图表4 - 各类状态分布比例
const initChart4 = async () => {
  try {
    const response = await findEmotionResultByEightIndicators(timeFilter.value);
    const data = response.data || response;
    const High = [
      data.fatigueHighCount,
      data.aggressionHighCount,
      data.stressHighCount,
      data.tensionHighCount,
      data.charmHighCount,
      data.energyHighCount,
      data.regulationHighCount,
      data.depressionHighCount,
    ];
    const Mid = [
      data.fatigueMediumCount,
      data.aggressionMediumCount,
      data.stressMediumCount,
      data.tensionMediumCount,
      data.charmMediumCount,
      data.energyMediumCount,
      data.regulationMediumCount,
      data.depressionMediumCount,
    ];

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        textStyle: {
          color: 'white',
        },
        left: 'right',
        top: 'top',
        padding: [10, 0, 0, 0],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: ['疲劳', '激动', '压力', '焦虑', '平衡', '能量', '稳定', '压抑'],
          axisLine: {
            show: true,
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            show: true,
            color: 'white',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            show: true,
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            show: true,
            color: 'white',
          },
        },
      ],
      series: [
        {
          name: '高',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#f44336',
          },
          emphasis: {
            focus: 'series',
          },
          data: High,
          barMaxWidth: 50,
        },
        {
          name: '低',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#c8c533',
          },
          emphasis: {
            focus: 'series',
          },
          data: Mid,
        },
      ],
    };
    setChart4Options(option);
  } catch (error) {
    console.error('获取各类状态分布比例失败:', error);
  }
};

// 初始化图表5 - 近15天心理状态统计
const initChart5 = async () => {
  try {
    const response = await countNumberByPsychology();
    const data = response.data || response;
    const currentTime: string[] = [];
    let j = 14;
    const concernCount: number[] = [];
    const commonlyCount: number[] = [];

    for (let i = 0; i < data.length; i++) {
      const time = data[i].createdAt.split('-');
      currentTime[j] = time[1] + '-' + time[2];
      concernCount[j] = data[i].concernCount;
      commonlyCount[j] = data[i].commonlyCount;
      j--;
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      legend: {
        data: ['一般', '关注'],
        textStyle: {
          color: 'white',
        },
        left: 'right',
        top: 'top',
        padding: [10, 0, 0, 0],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: currentTime,
          axisLine: {
            show: true,
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            show: true,
            color: 'white',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            show: true,
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            show: true,
            color: 'white',
          },
        },
      ],
      series: [
        {
          name: '一般',
          type: 'line',
          stack: 'Total',
          itemStyle: {
            color: '#c8c533',
          },
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
          data: commonlyCount,
        },
        {
          name: '关注',
          type: 'line',
          stack: 'Total',
          itemStyle: {
            color: '#f44336',
          },
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
          data: concernCount,
        },
      ],
    };
    setChart5Options(option);
  } catch (error) {
    console.error('获取近15天心理状态统计失败:', error);
  }
};

// 初始化图表8 - 年龄比例
const initChart8 = async () => {
  try {
    const response = await getPsychologyGroupByAge(timeFilter.value);
    const data = response.data || response;
    const commonlyCount: number[] = [];
    const concernCount: number[] = [];
    const normalCount: number[] = [];

    for (let i = 0; i < data.length; i++) {
      commonlyCount[i] = data[i].commonlyCount;
      concernCount[i] = data[i].concernCount;
      normalCount[i] = data[i].normalCount;
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        textStyle: {
          color: 'white',
        },
        left: 'right',
        top: 'top',
        padding: [10, 0, 0, 0],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: ['20以下', '20-25', '25-30', '30-40', '40以上'],
          axisLine: {
            show: true,
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            interval: 0,
            show: true,
            color: 'white',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            show: true,
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            show: true,
            color: 'white',
          },
        },
      ],
      series: [
        {
          name: '正常',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#4CAF50',
          },
          emphasis: {
            focus: 'series',
          },
          data: normalCount,
          barMaxWidth: 50,
        },
        {
          name: '关注',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#f44336',
          },
          emphasis: {
            focus: 'series',
          },
          data: concernCount,
        },
        {
          name: '一般',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#c8c533',
          },
          emphasis: {
            focus: 'series',
          },
          data: commonlyCount,
        },
      ],
    };
    setChart8Options(option);
  } catch (error) {
    console.error('获取年龄比例失败:', error);
  }
};

// 初始化图表9 - 任务完成情况统计
const initChart9 = async () => {
  try {
    const response = await countTest(timeFilter.value);
    const data = response.data || response;
    const testName: string[] = [];
    const mediumCount: number[] = [];
    const followCount: number[] = [];
    const normalCount: number[] = [];

    for (let i = 0; i < data.length; i++) {
      mediumCount[i] = data[i].mediumCount;
      followCount[i] = data[i].followCount;
      normalCount[i] = data[i].normalCount;
      testName[i] = data[i].testName;
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        textStyle: {
          color: 'white',
        },
        left: 'right',
        top: 'top',
        padding: [10, 0, 0, 0],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: testName,
          axisLine: {
            show: true,
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            interval: 0,
            show: true,
            color: 'white',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            show: true,
            lineStyle: {
              color: 'white',
            },
          },
          axisLabel: {
            show: true,
            color: 'white',
          },
        },
      ],
      series: [
        {
          name: '正常',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#4CAF50',
          },
          barMaxWidth: 50,
          emphasis: {
            focus: 'series',
          },
          data: normalCount,
        },
        {
          name: '一般',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#c8c533',
          },
          emphasis: {
            focus: 'series',
          },
          data: mediumCount,
        },
        {
          name: '关注',
          type: 'bar',
          stack: 'Ad',
          itemStyle: {
            color: '#f44336',
          },
          emphasis: {
            focus: 'series',
          },
          data: followCount,
        },
      ],
    };
    setChart9Options(option);
  } catch (error) {
    console.error('获取任务完成情况统计失败:', error);
  }
};

// 获取统计数据
const loadStatistics = async () => {
  try {
    // 总人数
    const headcountRes = await findAllPeopleCount(timeFilter.value);
    const headcountData = headcountRes?.data ?? headcountRes;
    statistics.value.headcount = typeof headcountData === 'number' ? headcountData : Number(headcountData) || 0;

    // 总次数
    const totalTimesRes = await findAllMidCount(timeFilter.value);
    const totalTimesData = totalTimesRes?.data ?? totalTimesRes;
    statistics.value.totalTimes = typeof totalTimesData === 'number' ? totalTimesData : Number(totalTimesData) || 0;

    // 回访人数
    const returnVisitorsRes = await findAnnotationByType(2, timeFilter.value);
    const returnVisitorsData = returnVisitorsRes?.data ?? returnVisitorsRes;
    statistics.value.returnVisitors = typeof returnVisitorsData === 'number' ? returnVisitorsData : Number(returnVisitorsData) || 0;
    
    const returnVisitorsTodayRes = await findAnnotationByType(0, timeFilter.value);
    const returnVisitorsTodayData = returnVisitorsTodayRes?.data ?? returnVisitorsTodayRes;
    statistics.value.returnVisitorsToday = typeof returnVisitorsTodayData === 'number' ? returnVisitorsTodayData : Number(returnVisitorsTodayData) || 0;
    
    const returnVisitorsWeekRes = await findAnnotationByType(1, timeFilter.value);
    const returnVisitorsWeekData = returnVisitorsWeekRes?.data ?? returnVisitorsWeekRes;
    statistics.value.returnVisitorsWeek = typeof returnVisitorsWeekData === 'number' ? returnVisitorsWeekData : Number(returnVisitorsWeekData) || 0;

    // 建模人数
    const modelersRes = await findModelingByType(2, timeFilter.value);
    const modelersData = modelersRes?.data ?? modelersRes;
    statistics.value.modelers = typeof modelersData === 'number' ? modelersData : Number(modelersData) || 0;
    
    const modelersTodayRes = await findModelingByType(0, timeFilter.value);
    const modelersTodayData = modelersTodayRes?.data ?? modelersTodayRes;
    statistics.value.modelersToday = typeof modelersTodayData === 'number' ? modelersTodayData : Number(modelersTodayData) || 0;
    
    const modelersWeekRes = await findModelingByType(1, timeFilter.value);
    const modelersWeekData = modelersWeekRes?.data ?? modelersWeekRes;
    statistics.value.modelersWeek = typeof modelersWeekData === 'number' ? modelersWeekData : Number(modelersWeekData) || 0;
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

// 获取关注人员列表
const loadFollowedList = async () => {
  try {
    const response = await findFollowedInformation();
    followedList.value = (response.data || response) || [];
  } catch (error) {
    console.error('获取关注人员列表失败:', error);
  }
};

// 时间筛选处理
const handleTimeFilter = (value: number) => {
  timeFilter.value = value;
  loadAllData();
};

// 初始化图表7 - 近15天性别统计（左侧图表 - 男性）
// 根据HTML页面，此图表容器存在但未实现数据获取，暂时显示空图表
const initChart7 = async () => {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    legend: {
      left: 'center',
      top: 'bottom',
      data: ['高', '低'],
      textStyle: {
        color: 'white',
      },
    },
    series: [
      {
        name: '男性',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
        },
        label: {
          show: true,
          formatter: '{b}: {c}',
          color: 'white',
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: 'white',
          },
        },
        data: [
          { value: 0, name: '高', itemStyle: { color: '#f44336' } },
          { value: 0, name: '低', itemStyle: { color: '#c8c533' } },
        ],
      },
    ],
  };
  setChart7Options(option);
};

// 初始化图表71 - 近15天性别统计（右侧图表 - 女性）
// 根据HTML页面，此图表容器存在但未实现数据获取，暂时显示空图表
const initChart71 = async () => {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    legend: {
      left: 'center',
      top: 'bottom',
      data: ['高', '低'],
      textStyle: {
        color: 'white',
      },
    },
    series: [
      {
        name: '女性',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
        },
        label: {
          show: true,
          formatter: '{b}: {c}',
          color: 'white',
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: 'white',
          },
        },
        data: [
          { value: 0, name: '高', itemStyle: { color: '#f44336' } },
          { value: 0, name: '低', itemStyle: { color: '#c8c533' } },
        ],
      },
    ],
  };
  setChart71Options(option);
};

// 加载所有数据
const loadAllData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadStatistics(),
      loadFollowedList(),
      initChart1(),
      initChart2(),
      initChart3(),
      initChart4(),
      initChart5(),
      initChart7(),
      initChart71(),
      initChart8(),
      initChart9(),
    ]);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
};

// 初始化
onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
  loadAllData();
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped lang="less">
.ksh {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #0a1e3c;
  color: white;
  position: relative;
}

.load {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;

  .load_img {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 200px;

    .jzxz1 {
      position: absolute;
      width: 100%;
      height: 100%;
      animation: rotateOuter 2s linear infinite;
    }

    .jzxz2 {
      position: absolute;
      width: 80%;
      height: 80%;
      animation: rotateInner 1.5s linear infinite reverse;
    }
  }
}

@keyframes rotateOuter {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes rotateInner {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.head_top {
  position: relative;
  height: 10vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: linear-gradient(180deg, #0a1e3c 0%, #1a2e4c 100%);
  box-sizing: border-box;
  width: 100%;

  .time_filtering {
    position: absolute;
    top: 15px;
    left: 100px;
    display: flex;
    gap: 10px;

    .button {
      background-color: #052452;
      color: white;
      border: 1px solid #052452;
      border-radius: 8px;
      padding: 8px 16px;
      cursor: pointer;
      transition: background-color 0.3s, border-color 0.3s, transform 0.3s;

      &:hover {
        background-color: #063a6b;
      }

      &.selected {
        transform: scale(1.1);
        border-color: white;
        background-color: #0a4a8a;
      }
    }
  }

  .img-responsive {
    height: 60px;
    margin-left: 200px;
  }

  .time_clock {
    margin-left: auto;

    .date {
      .week {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .wek {
          font-size: 14px;
          margin-bottom: 5px;
        }

        .day {
          font-size: 16px;
          margin-bottom: 5px;
        }

        .time {
          font-size: 20px;
          font-weight: bold;
        }
      }
    }
  }
}

.visual {
  width: 100%;
  height: calc(100vh - 10vh);
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;

  .visual_left {
    width: 25%;
    float: left;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .visual_right {
    width: 25%;
    float: right;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .visual_con {
    width: 50%;
    float: left;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .visual_box {
    background: rgba(5, 36, 82, 0.3);
    border: 1px solid rgba(68, 135, 213, 0.3);
    border-radius: 4px;
    padding: 10px;
    box-sizing: border-box;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    .visual_title {
      height: 30px;
      line-height: 30px;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      border-bottom: 1px solid rgba(68, 135, 213, 0.3);
      flex-shrink: 0;

      span {
        color: white;
      }
    }

    .visual_chart {
      width: 100%;
      flex: 1;
      min-height: 0;
    }
  }

  .visual_conTop {
    display: flex;
    gap: 10px;
    height: 25%;
    flex-shrink: 0;
    margin-bottom: 10px;
    width: 100%;

    :deep(.data_box) {
      cursor: default;
      pointer-events: none;
    }
  }

  .visual_conBot {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;

    .visual_conBot_chart {
      display: flex;
      gap: 10px;
      height: 50%;
      flex-shrink: 0;

      .visual_box {
        flex: 1;
        min-height: 0;
      }
    }

    .tb_header {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;

      .visual_table {
        flex: 1;
        overflow: auto;
        min-height: 0;

        table {
          width: 100%;
          border-collapse: collapse;

          .swiper_header {
            background: rgba(68, 135, 213, 0.2);
            height: 40px;

            th {
              text-align: center;
              padding: 8px;
              border: 1px solid rgba(68, 135, 213, 0.3);
              color: white;
              font-weight: bold;
            }
          }

          tbody {
            tr {
              &.oddrowcolor {
                box-shadow: inset 0px 0px 13px #4487d5;
                height: 4vh;
                border: 0;
                font-size: 14px;
              }

              &.evenrowcolor {
                background-color: transparent;
                height: 4vh;
                font-size: 14px;
              }

              td {
                text-align: center;
                padding: 8px;
                border: 1px solid rgba(68, 135, 213, 0.2);
                color: aliceblue;
              }
            }
          }
        }
      }
    }
  }
}

.clear {
  clear: both;
}

#rollLinkk1 {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

