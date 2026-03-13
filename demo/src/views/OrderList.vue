<template>
  <div class="order-list-page">
    <div class="page-container">
      <!-- 左侧侧边栏 - Figma 风格 -->
      <aside class="sidebar animate-fade-in-left">
        <div class="sidebar-header">
          <!-- 侧边栏 Logo -->
          <div class="sidebar-logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="8" width="10" height="24" rx="5" transform="rotate(-20 8 8)" fill="#D8C41A"/>
              <rect x="20" y="8" width="10" height="24" rx="5" transform="rotate(-20 20 8)" fill="#D8C41A"/>
              <rect x="32" y="8" width="10" height="24" rx="5" transform="rotate(-20 32 8)" fill="#D8C41A"/>
            </svg>
            <span class="logo-text">Campus<span class="logo-bold">Help</span></span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <button
            v-for="type in taskTypes"
            :key="type.value"
            :class="['nav-item', { active: filters.task_type === type.value }]"
            @click="filters.task_type = type.value; loadOrders()"
          >
            <div class="nav-icon">
              <!-- 根据类型显示不同图标 -->
              <svg v-if="type.value === '全部'" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z"/>
              </svg>
              <svg v-else-if="type.value === '快递代取'" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 8h-3V4H3v16h18v-8zM5 6h10v2H5V6zm14 12H5v-6h14v6z"/>
                <path d="M7 14h2v2H7z"/>
              </svg>
              <svg v-else-if="type.value === '外卖代取'" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <span class="nav-label">{{ type.label }}</span>
          </button>
        </nav>
      </aside>

      <!-- 右侧内容区 -->
      <main class="content-area">
        <!-- 头部统计与排序 -->
        <header class="content-header animate-fade-in-down">
          <div class="header-left">
            <h1 class="page-title">{{ currentTypeLabel }}订单</h1>
            <p class="page-subtitle" v-if="orders.length > 0">共找到 {{ orders.length }} 个待接订单</p>
          </div>
          
          <div class="sort-group">
            <button
              :class="['sort-btn', { active: filters.sort_by === 'time' }]"
              @click="filters.sort_by = 'time'; loadOrders()"
            >
              <span>最新发布</span>
            </button>
            <button
              :class="['sort-btn', { active: filters.sort_by === 'reward' }]"
              @click="toggleRewardSort()"
            >
              <span>报酬 {{ filters.order === 'desc' ? '↓' : '↑' }}</span>
            </button>
          </div>
        </header>

        <!-- 订单列表 -->
        <div class="orders-grid">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <span>正在加载...</span>
          </div>

          <!-- 空状态 -->
          <div v-else-if="orders.length === 0" class="empty-state animate-fade-in-up">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 13V6A2 2 0 0018 4H6A2 2 0 004 6V13M20 13V18A2 2 0 0118 20H6A2 2 0 014 18V13M20 13H4M8 10H10M12 10H14M16 10H18M8 14H10M12 14H14M16 14H18" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="empty-title">暂无订单</h3>
            <p class="empty-desc">当前分类下暂时没有待接订单</p>
          </div>

          <!-- 列表内容 -->
          <div
            v-else
            v-for="(order, index) in orders"
            :key="order.id"
            :class="['order-card', `animate-fade-in-up`, `stagger-${(index % 6) + 2}`]"
            @click="viewDetail(order.id)"
          >
            <div class="order-card-inner">
              <div class="card-top">
                <div class="user-info">
                  <div class="avatar-placeholder">{{ order.publisher_contact?.[0] || 'U' }}</div>
                  <div class="user-meta">
                    <span class="user-name">同学 {{ order.publisher_id?.slice(-4) || '****' }}</span>
                    <span class="publish-time">{{ formatTimeAgo(order.created_at) }}</span>
                  </div>
                </div>
                <div class="reward-tag">
                  <span class="currency">¥</span>
                  <span class="amount">{{ order.reward_amount }}</span>
                </div>
              </div>
              
              <div class="card-content">
                <div class="route-line">
                  <div class="route-point pickup">
                    <span class="point-dot"></span>
                    <span class="point-text">{{ order.pickup_location }}</span>
                  </div>
                  <div class="route-connector"></div>
                  <div class="route-point delivery">
                    <span class="point-dot"></span>
                    <span class="point-text">{{ order.delivery_location }}</span>
                  </div>
                </div>
              </div>
              
              <div class="card-actions">
                <span class="deadline-tag" v-if="order.expected_time">
                  截止 {{ formatTime(order.expected_time) }}
                </span>
                <button class="accept-btn">接单</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineEmits, onMounted, defineExpose } from 'vue';
import { orderApi } from '../api';

const emit = defineEmits(['open-detail']);

const loading = ref(false);
const orders = ref([]);

const taskTypes = [
  { value: '全部', label: '全部订单' },
  { value: '外卖代取', label: '外卖代取' },
  { value: '快递代取', label: '快递代取' },
  { value: '其他跑腿', label: '其他代取' }
];

const filters = reactive({
  task_type: '全部',
  sort_by: 'time',
  order: 'desc'
});

const currentTypeLabel = computed(() => {
  return filters.task_type === '全部' ? '所有' : filters.task_type.replace('代取', '');
});

const toggleRewardSort = () => {
  filters.sort_by = 'reward';
  filters.order = filters.order === 'desc' ? 'asc' : 'desc';
  loadOrders();
};

const loadOrders = async () => {
  loading.value = true;
  try {
    const params = {
      task_type: filters.task_type,
      sort_by: filters.sort_by,
      order: filters.order
    };
    const response = await orderApi.getList(params);
    orders.value = response.data;
  } catch (error) {
    console.error('加载订单失败:', error);
    // 实际开发中可以显示 Toast
  } finally {
    loading.value = false;
  }
};

const viewDetail = (id) => {
  emit('open-detail', id);
};

const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatTimeAgo = (time) => {
  if (!time) return '';
  const now = new Date();
  const dateStr = time.endsWith('Z') ? time : time + 'Z';
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
};

defineExpose({
  loadOrders
});

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.order-list-page {
  background: var(--slate-50);
  min-height: calc(100vh - 60px); /* 减去底部 TabBar 高度 */
  padding-bottom: 80px;
}

.page-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);
  gap: var(--space-4);
  height: calc(100vh - 80px); /* 固定高度以支持滚动 */
}

/* 左侧侧边栏 */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: transparent;
  padding: var(--space-6) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  height: 100%;
}

.sidebar-header {
  padding-left: var(--space-4);
}

.sidebar-logo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.sidebar-logo svg {
  width: 48px;
  height: 48px;
}

.logo-text {
  font-size: 24px;
  color: var(--primary-500); /* 亮黄色 */
  font-weight: 400;
  letter-spacing: -0.02em;
}

.logo-bold {
  font-weight: 700;
  color: #000000;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 14px 24px;
  border-radius: var(--radius-lg);
  border: none;
  background: transparent;
  color: #000000;
  cursor: pointer;
  transition: all var(--duration-fast);
  text-align: left;
  width: 100%;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.5);
}

.nav-item.active {
  background: var(--primary-500); /* 亮黄色高亮 */
  color: #000000;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(216, 196, 26, 0.2);
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-500); /* 默认黄色图标 */
}

.nav-item.active .nav-icon {
  color: #000000; /* 选中时黑色图标 */
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
  transition: transform var(--duration-fast);
}

.nav-icon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.nav-label {
  font-size: 16px;
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  overflow-y: auto;
  padding-right: var(--space-2); /* 预留滚动条空间 */
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 var(--space-2);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--slate-900);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 13px;
  color: var(--slate-500);
}

.sort-group {
  display: flex;
  gap: var(--space-2);
}

.sort-btn {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: var(--radius-md);
  border: 1px solid var(--slate-200);
  background: #FFFFFF;
  color: var(--slate-600);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.sort-btn:hover {
  border-color: var(--slate-300);
  color: var(--slate-900);
}

.sort-btn.active {
  background: var(--slate-900);
  color: #FFFFFF;
  border-color: var(--slate-900);
}

/* 订单网格 */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
  padding-bottom: var(--space-8);
}

/* 订单卡片 - Figma 风格 */
.order-card-inner {
  background: #FFFFFF;
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  border: 1px solid transparent;
  transition: all var(--duration-normal);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: 100%;
}

.order-card:hover .order-card-inner {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-200);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--slate-900);
}

.publish-time {
  font-size: 11px;
  color: var(--slate-400);
}

.reward-tag {
  background: var(--slate-900);
  color: #FFFFFF;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 14px;
}

.currency {
  font-size: 12px;
  margin-right: 2px;
  opacity: 0.8;
}

/* 路线样式 */
.route-line {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.route-point {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.point-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pickup .point-dot {
  background: var(--primary-500);
  box-shadow: 0 0 0 2px var(--primary-100);
}

.delivery .point-dot {
  background: var(--success);
  box-shadow: 0 0 0 2px var(--success-bg);
}

.point-text {
  font-size: 14px;
  color: var(--slate-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.route-connector {
  width: 2px;
  height: 12px;
  background: var(--slate-200);
  margin-left: 3px;
  border-radius: 1px;
}

.card-actions {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px dashed var(--slate-100);
}

.deadline-tag {
  font-size: 12px;
  color: var(--slate-500);
  background: var(--slate-50);
  padding: 2px 8px;
  border-radius: 4px;
}

.accept-btn {
  background: transparent;
  color: var(--slate-900);
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: var(--radius-md);
  transition: background var(--duration-fast);
}

.accept-btn:hover {
  background: var(--slate-100);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-container {
    flex-direction: column;
    padding: var(--space-2);
  }

  .sidebar {
    width: 100%;
    height: auto;
    padding: var(--space-3);
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .nav-item {
    flex-shrink: 0;
    width: auto;
    white-space: nowrap;
  }
}
</style>
