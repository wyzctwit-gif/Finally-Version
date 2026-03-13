<template>
  <div class="home-page">
    <!-- 品牌头部 -->
    <header class="brand-header animate-fade-in-down">
      <div class="brand-logo">
        <div class="logo-icon">
          <!-- 替换为黑色风格 Logo -->
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 12C12 9.79086 13.7909 8 16 8H20C22.2091 8 24 9.79086 24 12V36C24 38.2091 22.2091 40 20 40H16C13.7909 40 12 38.2091 12 36V12Z" fill="#000000"/>
             <path d="M24 12C24 9.79086 25.7909 8 28 8H32C34.2091 8 36 9.79086 36 12V36C36 38.2091 34.2091 40 32 40H28C25.7909 40 24 38.2091 24 36V12Z" fill="#000000" fill-opacity="0.8"/>
             <path d="M36 12C36 9.79086 37.7909 8 40 8H44C46.2091 8 48 9.79086 48 12V36C48 38.2091 46.2091 40 44 40H40C37.7909 40 36 38.2091 36 36V12Z" fill="#000000" fill-opacity="0.6"/>
          </svg>
        </div>
      </div>
      <h1 class="brand-title">校园代取</h1>
      <p class="brand-subtitle">匿名 · 高效 · 互助</p>
    </header>

    <!-- 主要操作区 - 白色卡片容器 -->
    <main class="main-card animate-fade-in-up">
      <h2 class="section-title">你需要什么服务？</h2>
      
      <div class="action-buttons">
        <!-- 发布按钮 -->
        <button class="btn btn-primary btn-lg btn-block action-btn" @click="handlePublish">
          <span class="btn-text">发布新订单</span>
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5V19M5 12H19" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- 接单按钮 -->
        <button class="btn btn-secondary btn-lg btn-block action-btn" @click="handleAccept">
          <span class="btn-text">我是跑腿员</span>
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18L15 12L9 6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 分隔线 -->
      <div class="divider">
        <span>或者</span>
      </div>

      <!-- 快捷入口 -->
      <div class="quick-links">
        <div class="quick-link-item" @click="handleAccept">
          <div class="quick-icon">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6V12L16 14" stroke-linecap="round"/>
            </svg>
          </div>
          <span>实时状态</span>
        </div>
        <div class="quick-link-item" @click="handlePublish">
           <div class="quick-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a2 2 0 002 2h12a2 2 0 002-2z"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
           </div>
          <span>匿名发布</span>
        </div>
      </div>
    </main>

    <!-- 底部统计 -->
    <footer class="stats-footer animate-fade-in-up stagger-2">
      <div class="stat-item">
        <span class="stat-num">128</span>
        <span class="stat-desc">今日订单</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">45</span>
        <span class="stat-desc">待接单</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const emit = defineEmits(['switch-tab']);

const handlePublish = () => {
  router.push({ name: 'Publish' });
};

const handleAccept = () => {
  emit('switch-tab', 'orders');
};
</script>

<style scoped>
.home-page {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--space-8) var(--container-padding);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

/* 品牌头部 */
.brand-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.brand-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--slate-900);
  margin-bottom: var(--space-2);
  letter-spacing: -0.03em;
}

.brand-subtitle {
  font-size: 16px;
  color: var(--slate-800);
  opacity: 0.7;
  font-weight: 500;
}

/* 白色卡片容器 */
.main-card {
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  padding: var(--space-8) var(--space-6);
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--slate-900);
  margin-bottom: var(--space-6);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.btn-block {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 16px;
  border-radius: var(--radius-lg);
  font-size: 16px;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* 分隔线 */
.divider {
  display: flex;
  align-items: center;
  margin: var(--space-6) 0;
  color: var(--slate-400);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--slate-200);
}

.divider span {
  padding: 0 var(--space-4);
}

/* 快捷入口 */
.quick-links {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--space-8);
}

.quick-link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  color: var(--slate-600);
  transition: all var(--duration-fast);
}

.quick-link-item:hover {
  color: var(--slate-900);
  transform: translateY(-2px);
}

.quick-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--slate-50);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--slate-200);
}

.quick-icon svg {
  width: 20px;
  height: 20px;
}

.login-hint {
  font-size: 14px;
  color: var(--slate-500);
}

.link-highlight {
  color: var(--slate-900);
  font-weight: 600;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
  text-decoration-color: var(--primary-400);
}

.link-highlight:hover {
  text-decoration-color: var(--primary-600);
}

/* 底部统计 */
.stats-footer {
  margin-top: var(--space-8);
  display: flex;
  align-items: center;
  gap: var(--space-6);
  color: var(--slate-800);
}

.stat-item {
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-desc {
  font-size: 12px;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(0,0,0,0.1);
}
</style>
