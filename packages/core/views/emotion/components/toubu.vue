<template>
  <div class="header-stats-container">
    <div 
      v-for="(card, index) in cards" 
      :key="index" 
      class="stat-card-item"
      @click="handleCardClick(card.jumpId)"
    >
      <!-- 卡片图标 -->
      <div class="card-icon">
        <img :src="card.imgSrc" :alt="card.imgAlt || card.title" class="icon-img">
      </div>
      
      <!-- 卡片内容 -->
      <div class="card-content">
        <div class="card-title">{{ card.title }}</div>
        <div class="card-value">{{ card.value !== undefined ? card.value : 0 }}</div>
      </div>
      
    </div>
  </div>
</template>

<script setup>

// 定义组件接收的参数
const props = defineProps({
  cards: {
    type: Array,
    required: true,
    description: '头部统计卡片配置数组'
  }
});

</script>

<style scoped>
.header-stats-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  width: 100%;
  height: 17vh;
  gap: 16px;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stat-card-item {
  flex: 1;
  min-width: 180px;
  height: 100%;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  border-left: 4px solid #007bff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-card-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #e0e0e0;
  margin-bottom: 4px;
}

.card-value {
  font-size: 22px;
  font-weight: bold;
  color: #ffffff;
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .header-stats-container {
    flex-wrap: wrap;
    height: auto;
    min-height: 17vh;
  }
  
  .stat-card-item {
    min-width: 140px;
  }
}
</style>