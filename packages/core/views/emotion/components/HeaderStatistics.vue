<template>
  <div 
    class="data_box item" 
    :style="backgroundStyle" 
    @click="handleClick"
  >
    <div class="textInfo">
      <p>{{ title }}</p>
      <span :class="valueClass">{{ value }}</span>
    </div>
    <div class="img">
      <img :src="icon" style="width: 80%" />
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
  // 数值的类名（用于样式区分）
  valueClass: {
    type: String,
    default: ''
  },
  // 图标路径
  icon: {
    type: String,
    required: true
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
    backgroundImage: `url(${bgImg})`
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
.data_box {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 90%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-repeat: no-repeat;
  background-position: center center;
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
</style>