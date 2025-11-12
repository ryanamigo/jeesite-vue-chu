<template>
  <div 
    class="visual_conTop_box" 
    :class="boxClass"
    :style="backgroundStyle" 
    @click="handleClick"
  >
    <div>
      <h3>{{ title }}</h3>
      <p class="stat-value">{{ value }}</p>
      <div class="conTop_smil" v-if="showTodayWeek">
        <a>
          <span v-if="todayLabel">{{ todayLabel }}:</span>
          <span class="today-value">{{ todayValue || 0 }}</span>
          <span class="arrow-icon">↑</span>
        </a>
        <a>
          <span v-if="weekLabel">{{ weekLabel }}:</span>
          <span class="week-value">{{ weekValue || 0 }}</span>
          <span class="arrow-icon">↓</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import titBg from '@jeesite/assets/images/img-北京/tit-01.png';

// 定义接收的属性
const props = defineProps({
  // 卡片标题（如：总人数、今日检测次数）
  title: {
    type: String,
    required: true
  },
  // 显示的数值
  value: {
    type: [Number, String],
    default: 0
  },
  // 今日数值
  todayValue: {
    type: [Number, String],
    default: 0
  },
  // 本周数值
  weekValue: {
    type: [Number, String],
    default: 0
  },
  // 今日标签（如：今日人数、今日次数）
  todayLabel: {
    type: String,
    default: ''
  },
  // 本周标签（如：本周人数、本周次数）
  weekLabel: {
    type: String,
    default: ''
  },
  // 是否显示今日和本周数据
  showTodayWeek: {
    type: Boolean,
    default: true
  },
  // 卡片样式类（visual_conTop1 或 visual_conTop2）
  boxClass: {
    type: String,
    default: 'visual_conTop1'
  },
  // 数值的类名（用于样式区分）
  valueClass: {
    type: String,
    default: ''
  },
  // 图标路径
  icon: {
    type: String,
    required: false
  },
  // 卡片唯一标识（用于跳转参数）
  cardId: {
    type: String,
    required: true
  },
  // 跳转时的标题
  jumpTitle: {
    type: String,
    required: true
  },
  // 自定义背景图片（可选）
  backgroundImage: {
    type: String,
    default: ''
  }
});

// 计算背景样式，如果传入了自定义背景图片则使用，否则使用默认
const backgroundStyle = computed(() => {
  const bgImg = props.backgroundImage || titBg;
  return {
    backgroundImage: `url(${bgImg})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: '90% 85%'
  };
});

// 定义自定义事件（仅声明一次，解决重复声明问题）
const emit = defineEmits(['cardClick']);

// 点击事件：向父组件传递参数
const handleClick = () => {
  emit('cardClick', props.cardId, props.jumpTitle);
};
</script>

<style scoped>
.visual_conTop_box {
  flex: 1;
  height: 100%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 90% 85%;
  padding: 10px;
  box-sizing: border-box;
}

.visual_conTop_box > div {
  width: 100%;
  text-align: center;
}

.visual_conTop_box h3 {
  color: #9afefe;
  font-size: 20px;
  margin: 0 0 10px 0;
  font-weight: normal;
}

.visual_conTop_box .stat-value {
  color: #e2dd0a;
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 10px 0;
  display: block;
}

.visual_conTop_box .conTop_smil {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
}

.visual_conTop_box .conTop_smil a {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.visual_conTop_box .conTop_smil a .today-value,
.visual_conTop_box .conTop_smil a .week-value {
  color: #e2dd0a;
  font-weight: bold;
  margin: 0 3px;
}

.visual_conTop_box .conTop_smil a .arrow-icon {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-left: 3px;
}
</style>