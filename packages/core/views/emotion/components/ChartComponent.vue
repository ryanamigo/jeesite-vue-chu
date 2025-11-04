<template>
  <div class="main_chart_inner">
    <div class="legendContainer" style="height: 5vh">
      <div class="legend-left">
        <label class="legend1">正常</label>
        <label class="legend2">一般</label>
        <label class="legend3">关注</label>
        <label class="legend4" style="margin-left: 80px;">{{ leftTitle }}</label>
      </div>
      <div class="legend-right">
        <label class="legend4" style="margin-right: 80px;">{{ rightTitle }}</label>
        <label class="legend3">关注</label>
        <label class="legend2">一般</label>
        <label class="legend1">正常</label>
      </div>
    </div>
    <div class="chart_box">
      <canvas :id="leftChartId"></canvas>
    </div>
    <div class="chart_box">
      <canvas :id="rightChartId"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useMessage } from '@jeesite/core/hooks/web/useMessage';

const { toast } = useMessage();

// 接收父组件参数
const props = defineProps({
  leftChartId: {
    type: String,
    default: 'myChart1'
  },
  rightChartId: {
    type: String,
    default: 'myChart2'
  },
  leftData: {
    type: Array,
    default: () => [0, 0, 0, 0, 0]
  },
  rightData: {
    type: Array,
    default: () => [0, 0, 0, 0, 0]
  },
  leftTitle: {
    type: String,
    default: '综合心理排序'
  },
  rightTitle: {
    type: String,
    default: '建模跟踪排序'
  }
});

// 图表实例
const leftChart = ref(null);
const rightChart = ref(null);

// 图表配置项
const getChartOptions = () => {
  return {
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: (context) => context.dataset.data[context.dataIndex] > 0,
        anchor: 'end',
        align: 'top',
        formatter: (value) => value,
        color: 'white',
        font: { size: 12 }
      },
      legend: { display: false }
    },
    scales: {
      x: {
        ticks: { color: 'white', font: { size: 16 } },
        grid: { display: false }
      },
      y: {
        ticks: { color: 'white', font: { size: 16 } },
        grid: { display: false }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const chartTitle = elements[0].chart.canvas.id === props.leftChartId 
          ? props.leftTitle 
          : props.rightTitle;
        toast.info(`点击了${chartTitle}第${index + 1}级数据`);
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

// 初始化图表
const initCharts = () => {
  // 左侧图表初始化
  const leftCtx = document.getElementById(props.leftChartId).getContext('2d');
  leftChart.value = new Chart(leftCtx, {
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

  // 右侧图表初始化
  const rightCtx = document.getElementById(props.rightChartId).getContext('2d');
  rightChart.value = new Chart(rightCtx, {
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

  // 初始化数据
  updateChartData(leftChart.value, props.leftData);
  updateChartData(rightChart.value, props.rightData);
};

// 监听数据变化自动更新图表
watch([() => props.leftData, () => props.rightData], ([newLeft, newRight], [oldLeft, oldRight]) => {
  if (JSON.stringify(newLeft) !== JSON.stringify(oldLeft)) {
    updateChartData(leftChart.value, newLeft);
  }
  if (JSON.stringify(newRight) !== JSON.stringify(oldRight)) {
    updateChartData(rightChart.value, newRight);
  }
}, { deep: true });

onMounted(() => {
  initCharts();
});
</script>

<style scoped>
.main_chart_inner {
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
  height: calc(100vh - 17vh - 8vh - 20px);
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