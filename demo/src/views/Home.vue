<template>
  <div class="home-page">
    <!-- 品牌头部 -->
    <header class="brand-header animate-fade-in-down">
      <div class="brand-logo">
        <div class="logo-icon">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" fill="url(#logo-gradient)"/>
            <path d="M24 8L28.5 18H38L30.5 24L33.5 34L24 28L14.5 34L17.5 24L10 18H19.5L24 8Z" fill="white"/>
            <defs>
              <linearGradient id="logo-gradient" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FF7F56"/>
                <stop offset="1" stop-color="#F05414"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <h1 class="brand-title">校园代取</h1>
      <p class="brand-subtitle">让代取更简单、更透明、更高效</p>
    </header>

    <!-- 主要操作区 -->
    <main class="main-actions">
      <!-- 发布卡片 -->
      <div
        class="action-card publish-card animate-fade-in-up stagger-1"
        @click="handlePublish"
      >
        <div class="action-card-bg"></div>
        <div class="action-card-content">
          <div class="action-icon publish-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5V19M5 12H19" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="action-text">
            <h3 class="action-title">发布代取</h3>
            <p class="action-desc">快速发布你的代取需求</p>
          </div>
          <div class="action-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18L15 12L9 6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 接单卡片 -->
      <div
        class="action-card accept-card animate-fade-in-up stagger-2"
        @click="handleAccept"
      >
        <div class="action-card-bg"></div>
        <div class="action-card-content">
          <div class="action-icon accept-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="action-text">
            <h3 class="action-title">接取代取</h3>
            <p class="action-desc">浏览订单，轻松赚取零花钱</p>
          </div>
          <div class="action-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18L15 12L9 6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </main>

    <!-- 特色说明 -->
    <section class="features-section animate-fade-in-up stagger-3">
      <div class="feature-item">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6V12L16 14" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="feature-text">
          <h4>实时状态</h4>
          <p>订单进度随时查看</p>
        </div>
      </div>
      <div class="feature-divider"></div>
      <div class="feature-item">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="feature-text">
          <h4>价格透明</h4>
          <p>明码标价，自主选择</p>
        </div>
      </div>
      <div class="feature-divider"></div>
      <div class="feature-item">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a2 2 0 002 2h12a2 2 0 002-2z"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <div class="feature-text">
          <h4>匿名发布</h4>
          <p>无需登录，保护隐私</p>
        </div>
      </div>
    </section>

    <!-- 风险提示 -->
    <div class="warning-section animate-fade-in-up stagger-4">
      <div class="alert alert-warning">
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <path d="M12 9V13M12 17H12.01" stroke-linecap="round"/>
        </svg>
        <span>交易前请仔细核对信息，注意人身和财产安全</span>
      </div>
    </div>

    <!-- 统计数据 -->
    <section class="stats-section animate-fade-in-up stagger-5">
      <div class="stat-card">
        <div class="stat-value">128</div>
        <div class="stat-label">今日订单</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">45</div>
        <div class="stat-label">待接订单</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">892</div>
        <div class="stat-label">累计完成</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits(['open-publish', 'switch-tab']);

const handlePublish = () => {
  emit('open-publish');
};

const handleAccept = () => {
  emit('switch-tab', 'orders');
};
</script>

<style scoped>
.home-page {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--space-6) var(--container-padding) var(--space-8);
}

/* 品牌头部 */
.brand-header {
  text-align: center;
  padding: var(--space-10) 0 var(--space-6);
}

.brand-logo {
  margin-bottom: var(--space-5);
}

.logo-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto;
  animation: bounce 2s var(--ease-in-out) infinite;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(255, 107, 53, 0.3));
}

.brand-title {
  font-size: var(--text-headline);
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-2);
  letter-spacing: -0.02em;
  line-height: var(--line-height-headline);
}

.brand-subtitle {
  font-size: var(--text-body);
  color: var(--slate-600);
  margin: 0;
  line-height: var(--line-height-body);
}

/* 主要操作区 */
.main-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.action-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  background: var(--gradient-card);
  box-shadow: var(--elevation-1);
  border: none;
}

.action-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-surface);
  z-index: 1;
  border-radius: var(--radius-xl);
}

.action-card-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(240, 84, 20, 0.02) 100%);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
  z-index: 0;
}

.action-card:hover .action-card-bg {
  opacity: 1;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--elevation-4);
}

.action-card:active {
  transform: translateY(-2px) scale(0.99);
}

.action-card-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: var(--space-5) var(--space-5);
  gap: var(--space-4);
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-out);
}

.action-icon svg {
  width: 28px;
  height: 28px;
}

.publish-icon {
  background: linear-gradient(135deg, var(--primary-100) 0%, var(--primary-50) 100%);
  color: var(--primary-600);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
}

.accept-icon {
  background: linear-gradient(135deg, #ECFDF5 0%, #F0FDFA 100%);
  color: var(--success);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.action-text {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--slate-800);
  margin-bottom: 4px;
}

.action-desc {
  font-size: 13px;
  color: var(--slate-500);
  margin: 0;
}

.action-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--slate-100);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-normal) var(--ease-out);
}

.action-arrow svg {
  width: 20px;
  height: 20px;
  color: var(--slate-600);
}

.action-card:hover .action-arrow {
  background: var(--primary-500);
}

.action-card:hover .action-arrow svg {
  color: white;
  transform: translateX(4px);
}

/* 特色说明 */
.features-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--gradient-card);
  border-radius: var(--radius-xl);
  padding: var(--space-5) var(--space-4);
  margin-bottom: var(--space-6);
  box-shadow: var(--elevation-1);
  border: 1px solid var(--slate-100);
}

.feature-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
}

.feature-icon {
  width: 40px;
  height: 40px;
  color: var(--primary-600);
}

.feature-icon svg {
  width: 100%;
  height: 100%;
}

.feature-text h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--slate-700);
  margin: 0;
}

.feature-text p {
  font-size: 12px;
  color: var(--slate-400);
  margin: 0;
}

.feature-divider {
  width: 1px;
  height: 40px;
  background: var(--slate-200);
}

/* 风险提示 */
.warning-section {
  margin-bottom: var(--space-6);
}

.alert {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-size: 14px;
  line-height: 1.5;
}

.alert-warning {
  background: var(--warning-bg);
  color: #8A6A0A;
  border: none;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: currentColor;
}

.alert-icon svg {
  width: 100%;
  height: 100%;
}

.alert span {
  margin: 0;
}

/* 统计数据 */
.stats-section {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-8);
}

.stat-card {
  flex: 1;
  background: var(--gradient-card);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-3);
  text-align: center;
  box-shadow: var(--elevation-1);
  border: 1px solid var(--slate-100);
  transition: all var(--duration-normal) var(--ease-out);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--elevation-2);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--slate-500);
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .action-card::before {
    background: var(--gradient-card);
  }

  .action-card-bg {
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.12) 0%, rgba(240, 84, 20, 0.04) 100%);
  }

  .action-card {
    border-color: var(--slate-700);
  }

  .features-section {
    border-color: var(--slate-700);
  }

  .stat-card {
    border-color: var(--slate-700);
  }
}
</style>
