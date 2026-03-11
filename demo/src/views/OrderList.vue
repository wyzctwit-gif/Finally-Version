<template>
  <div class="order-list-page">
    <!-- 页面头部 -->
    <header class="page-header animate-fade-in-down">
      <div class="header-content">
        <h1 class="page-title">待接订单</h1>
        <p class="page-subtitle">找到适合的订单，赚取零花钱</p>
      </div>
      <div class="order-count-badge" v-if="orders.length > 0">
        <span class="count-number">{{ orders.length }}</span>
        <span class="count-label">个订单</span>
      </div>
    </header>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar animate-fade-in-up stagger-1">
      <div class="filter-group">
        <div class="filter-chips">
          <button
            v-for="type in taskTypes"
            :key="type.value"
            :class="['filter-chip', { active: filters.task_type === type.value }]"
            @click="filters.task_type = type.value; loadOrders()"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <div class="sort-group">
        <button
          :class="['sort-btn', { active: filters.sort_by === 'time' }]"
          @click="filters.sort_by = 'time'; loadOrders()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6V12L16 14" stroke-linecap="round"/>
          </svg>
          <span>最新</span>
        </button>
        <button
          :class="['sort-btn', { active: filters.sort_by === 'reward' }]"
          @click="toggleRewardSort()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1V23M5 7L12 1L19 7M19 17L12 23L5 17" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ filters.order === 'desc' ? '报酬↓' : '报酬↑' }}</span>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>正在加载订单...</span>
    </div>

    <!-- 空状态 -->
    <div v-else-if="orders.length === 0" class="empty-state animate-fade-in-up">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20 13V6A2 2 0 0018 4H6A2 2 0 004 6V13M20 13V18A2 2 0 0118 20H6A2 2 0 014 18V13M20 13H4M8 10H10M12 10H14M16 10H18M8 14H10M12 14H14M16 14H18" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3 class="empty-title">暂无待接订单</h3>
      <p class="empty-desc">稍后再来看看吧，或者邀请同学发布代取需求</p>
    </div>

    <!-- 订单列表 -->
    <div v-else class="orders-container">
      <div
        v-for="(order, index) in orders"
        :key="order.id"
        :class="['order-card', `animate-fade-in-up`, `stagger-${(index % 6) + 2}`]"
        @click="viewDetail(order.id)"
      >
        <div class="order-card-inner">
          <!-- 卡片头部 -->
          <div class="card-header">
            <span :class="['type-badge', getTypeClass(order.task_type)]">
              {{ order.task_type }}
            </span>
            <div class="reward-amount">
              <span class="currency">¥</span>
              <span class="amount">{{ order.reward_amount }}</span>
            </div>
          </div>

          <!-- 卡片主体 -->
          <div class="card-body">
            <div class="location-row">
              <div class="location-icon pickup-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="location-info">
                <span class="location-label">取件</span>
                <span class="location-text">{{ order.pickup_location }}</span>
              </div>
            </div>

            <div class="location-row">
              <div class="location-icon delivery-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <div class="location-info">
                <span class="location-label">送达</span>
                <span class="location-text">{{ order.delivery_location }}</span>
              </div>
            </div>

            <!-- 附加信息 -->
            <div class="meta-info">
              <div v-if="order.expected_time" class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6V12L16 14" stroke-linecap="round"/>
                </svg>
                <span>{{ formatTime(order.expected_time) }}前完成</span>
              </div>
              <div class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ formatTimeAgo(order.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- 卡片尾部 -->
          <div class="card-footer">
            <div class="order-id">订单 #{{ order.id?.toString().slice(-4) || '0000' }}</div>
            <button class="view-btn">
              查看详情
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18L15 12L9 6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineEmits, onMounted, defineExpose } from 'vue';
import { orderApi } from '../api';

const emit = defineEmits(['open-detail']);

const loading = ref(false);
const orders = ref([]);

const taskTypes = [
  { value: '全部', label: '全部' },
  { value: '快递代取', label: '快递' },
  { value: '外卖代取', label: '外卖' },
  { value: '其他跑腿', label: '其他' }
];

const filters = reactive({
  task_type: '全部',
  sort_by: 'time',
  order: 'desc'
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
    alert('加载订单失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const viewDetail = (id) => {
  emit('open-detail', id);
};

const getTypeClass = (type) => {
  const map = {
    '快递代取': 'type-express',
    '外卖代取': 'type-food',
    '其他跑腿': 'type-other'
  };
  return map[type] || 'type-default';
};

const formatTime = (time) => {
  const date = new Date(time);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatTimeAgo = (time) => {
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
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-padding) calc(80px + env(safe-area-inset-bottom));
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-5) 0 var(--space-4);
  border-bottom: 1px solid var(--slate-200);
  margin-bottom: var(--space-4);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: var(--text-headline);
  font-weight: 700;
  color: var(--slate-800);
  margin: 0 0 4px 0;
  line-height: var(--line-height-headline);
}

.page-subtitle {
  font-size: var(--text-body);
  color: var(--slate-600);
  margin: 0;
  line-height: var(--line-height-body);
}

.order-count-badge {
  display: flex;
  align-items: baseline;
  gap: 4px;
  background: var(--gradient-primary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  color: white;
  box-shadow: var(--shadow-primary);
}

.count-number {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.count-label {
  font-size: 12px;
  opacity: 0.9;
}

/* 筛选工具栏 */
.filter-toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding: var(--space-4);
  background: var(--gradient-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--elevation-1);
  border: 1px solid var(--slate-100);
}

.filter-chips {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.filter-chip {
  padding: var(--space-2) var(--space-4);
  font-size: 14px;
  font-weight: 500;
  color: var(--slate-600);
  background: var(--slate-100);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.filter-chip:hover {
  background: var(--slate-200);
}

.filter-chip.active {
  background: var(--primary-500);
  color: white;
  box-shadow: var(--elevation-2);
}

.sort-group {
  display: flex;
  gap: var(--space-2);
}

.sort-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  font-size: 13px;
  font-weight: 500;
  color: var(--slate-600);
  background: var(--slate-100);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.sort-btn svg {
  width: 16px;
  height: 16px;
}

.sort-btn:hover {
  background: var(--slate-200);
}

.sort-btn.active {
  background: var(--slate-800);
  color: white;
  box-shadow: var(--elevation-1);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-6);
  color: var(--slate-400);
  gap: var(--space-3);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--slate-200);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-20) var(--space-6);
  text-align: center;
}

.empty-icon {
  width: 100px;
  height: 100px;
  margin-bottom: var(--space-5);
  color: var(--slate-300);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--slate-600);
  margin-bottom: var(--space-2);
}

.empty-desc {
  font-size: 14px;
  color: var(--slate-400);
  max-width: 280px;
  margin: 0;
  line-height: 1.6;
}

/* 订单列表 */
.orders-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.order-card {
  cursor: pointer;
}

.order-card-inner {
  background: var(--gradient-card);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--elevation-1);
  border: 1px solid var(--slate-100);
  transition: all var(--duration-normal) var(--ease-out);
}

.order-card:hover .order-card-inner {
  box-shadow: var(--elevation-2);
  border-color: var(--primary-200);
}

.order-card:active .order-card-inner {
  transform: scale(0.985);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.type-badge {
  padding: var(--space-1) var(--space-3);
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.type-express {
  background: linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%);
  color: #1D4ED8;
}

.type-food {
  background: linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%);
  color: #B45309;
}

.type-other {
  background: linear-gradient(135deg, #E0E7FF 0%, #EEF2FF 100%);
  color: #4338CA;
}

.reward-amount {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-600);
}

.amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-600);
  line-height: 1;
}

/* 卡片主体 */
.card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.location-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.location-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.location-icon svg {
  width: 14px;
  height: 14px;
}

.pickup-icon {
  background: var(--primary-100);
  color: var(--primary-600);
}

.delivery-icon {
  background: var(--success-bg);
  color: var(--success);
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.location-label {
  font-size: 11px;
  color: var(--slate-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.location-text {
  font-size: 14px;
  color: var(--slate-700);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 附加信息 */
.meta-info {
  display: flex;
  gap: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px dashed var(--slate-200);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 12px;
  color: var(--slate-500);
}

.meta-item svg {
  width: 14px;
  height: 14px;
}

/* 卡片尾部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--slate-100);
}

.order-id {
  font-size: 11px;
  color: var(--slate-400);
  font-family: var(--font-mono);
}

.view-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  font-size: 13px;
  font-weight: 500;
  color: var(--primary-600);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.view-btn svg {
  width: 16px;
  height: 16px;
  transition: transform var(--duration-fast) var(--ease-out);
}

.view-btn:hover {
  background: var(--primary-50);
}

.view-btn:hover svg {
  transform: translateX(2px);
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .page-header {
    border-bottom-color: var(--slate-700);
  }

  .filter-toolbar {
    border-color: var(--slate-700);
  }

  .order-card-inner {
    border-color: var(--slate-700);
  }

  .meta-info {
    border-top-color: var(--slate-700);
  }

  .card-footer {
    border-top-color: var(--slate-800);
  }

  .sort-btn.active {
    background: var(--slate-600);
  }

  .filter-chip {
    background: var(--slate-700);
    color: var(--slate-400);
  }

  .filter-chip:hover {
    background: var(--slate-600);
  }

  .sort-btn {
    background: var(--slate-700);
    color: var(--slate-400);
  }

  .sort-btn:hover {
    background: var(--slate-600);
  }
}
</style>
