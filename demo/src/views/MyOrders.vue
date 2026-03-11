<template>
  <div class="my-orders-page">
    <!-- 页面头部 -->
    <header class="page-header animate-fade-in-down">
      <div class="header-content">
        <h1 class="page-title">我的订单</h1>
        <p class="page-subtitle">查看我的发布和接单记录</p>
      </div>
    </header>

    <!-- Tab 切换 -->
    <div class="tab-segment animate-fade-in-up stagger-1">
      <button
        :class="['tab-btn', { active: activeTab === 'published' }]"
        @click="activeTab = 'published'"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>我的发布</span>
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'accepted' }]"
        @click="activeTab = 'accepted'"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>我的接单</span>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 空状态 -->
    <div v-else-if="currentOrders.length === 0" class="empty-state animate-fade-in-up">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3 class="empty-title">{{ activeTab === 'published' ? '暂无发布的订单' : '暂无接单记录' }}</h3>
      <p class="empty-desc">
        {{ activeTab === 'published' ? '去发布一个代取任务吧' : '去浏览待接订单，赚取零花钱' }}
      </p>
      <button
        v-if="activeTab === 'published'"
        class="btn btn-primary"
        @click="$emit('open-publish')"
      >
        发布代取
      </button>
    </div>

    <!-- 订单列表 -->
    <div v-else class="orders-container">
      <div
        v-for="(order, index) in currentOrders"
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
            <span :class="['status-badge', getStatusClass(order.status)]">
              {{ order.status }}
            </span>
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

            <div class="meta-row">
              <div class="meta-item">
                <span class="meta-label">报酬</span>
                <span class="meta-value reward">¥{{ order.reward_amount }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">时间</span>
                <span class="meta-value">{{ formatTimeAgo(order.created_at) }}</span>
              </div>
            </div>

            <!-- 联系方式 -->
            <div v-if="showContact(order)" class="contact-row">
              <div class="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a2 2 0 002 2h12a2 2 0 002-2z"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div class="contact-info">
                <span class="contact-label">{{ getContactLabel() }}</span>
                <span class="contact-value">{{ getContactValue(order) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineExpose, onMounted, watch } from 'vue';
import { orderApi } from '../api';

const emit = defineEmits(['open-detail', 'open-publish']);

const loading = ref(false);
const activeTab = ref('published');
const publishedOrders = ref([]);
const acceptedOrders = ref([]);

const currentOrders = computed(() => {
  return activeTab.value === 'published' ? publishedOrders.value : acceptedOrders.value;
});

const getUserIds = (type) => JSON.parse(localStorage.getItem(`${type}_ids`) || '[]');

const loadPublishedOrders = async () => {
  loading.value = true;
  try {
    const publisherIds = getUserIds('publisher');
    if (publisherIds.length === 0) { publishedOrders.value = []; return; }
    const promises = publisherIds.map(id => orderApi.getMyPublished(id));
    const responses = await Promise.all(promises);
    const allOrders = responses.flatMap(res => res.data);
    allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    publishedOrders.value = allOrders;
  } catch (error) {
    console.error('加载发布订单失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadAcceptedOrders = async () => {
  loading.value = true;
  try {
    const acceptorIds = getUserIds('acceptor');
    if (acceptorIds.length === 0) { acceptedOrders.value = []; return; }
    const promises = acceptorIds.map(id => orderApi.getMyAccepted(id));
    const responses = await Promise.all(promises);
    const allOrders = responses.flatMap(res => res.data);
    allOrders.sort((a, b) => new Date(b.accepted_at) - new Date(a.accepted_at));
    acceptedOrders.value = allOrders;
  } catch (error) {
    console.error('加载接单记录失败:', error);
  } finally {
    loading.value = false;
  }
};

const refreshOrders = () => {
  if (activeTab.value === 'published') loadPublishedOrders();
  else loadAcceptedOrders();
};

const viewDetail = (id) => {
  const mode = activeTab.value === 'published' ? 'published' : 'accepted';
  emit('open-detail', id, mode);
};

const showContact = (order) => {
  if (activeTab.value === 'published') {
    return (order.status === '已接单' || order.status === '进行中') && order.acceptor_contact;
  }
  return activeTab.value === 'accepted' && order.publisher_contact;
};

const getContactLabel = () => activeTab.value === 'published' ? '接单者' : '发布者';
const getContactValue = (order) => activeTab.value === 'published' ? order.acceptor_contact : order.publisher_contact;

const getStatusClass = (status) => {
  const map = { '待接单': 'pending', '已接单': 'accepted', '进行中': 'progress', '已完成': 'completed', '已取消': 'cancelled' };
  return map[status] || '';
};

const getTypeClass = (type) => {
  const map = { '快递代取': 'type-express', '外卖代取': 'type-food', '其他跑腿': 'type-other' };
  return map[type] || 'type-default';
};

const formatTimeAgo = (time) => {
  const now = new Date();
  const date = new Date(time.endsWith('Z') ? time : time + 'Z');
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
};

watch(activeTab, () => refreshOrders());
defineExpose({ refreshOrders });
onMounted(() => { loadPublishedOrders(); });
</script>

<style scoped>
.my-orders-page {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-padding) calc(80px + env(safe-area-inset-bottom));
}

/* 页面头部 */
.page-header {
  padding: var(--space-5) 0 var(--space-4);
  margin-bottom: var(--space-4);
}

.header-content h1 {
  font-size: var(--text-headline);
  font-weight: 700;
  color: var(--slate-800);
  margin: 0 0 4px 0;
  line-height: var(--line-height-headline);
}

.header-content p {
  font-size: var(--text-body);
  color: var(--slate-600);
  margin: 0;
  line-height: var(--line-height-body);
}

/* Tab 切换 - Material Design Segment */
.tab-segment {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-1);
  background: var(--slate-100);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: 14px;
  font-weight: 600;
  color: var(--slate-600);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.tab-btn:hover {
  color: var(--slate-800);
  background: var(--slate-200);
}

.tab-btn.active {
  background: var(--gradient-card);
  color: var(--primary-600);
  box-shadow: var(--elevation-1);
}

.tab-icon {
  width: 18px;
  height: 18px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-16);
  gap: var(--space-3);
  color: var(--slate-400);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--slate-200);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-16) var(--space-6);
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: var(--space-5);
  color: var(--slate-300);
}
.empty-icon svg { width: 100%; height: 100%; }

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--slate-600);
  margin-bottom: var(--space-2);
}

.empty-desc {
  font-size: 14px;
  color: var(--slate-400);
  margin-bottom: var(--space-5);
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
}
.type-express { background: #DBEAFE; color: #1D4ED8; }
.type-food { background: #FEF3C7; color: #B45309; }
.type-other { background: #E0E7FF; color: #4338CA; }

.status-badge {
  padding: var(--space-1) var(--space-3);
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-full);
}
.status-pending { background: #FEF3C7; color: #B45309; }
.status-accepted { background: #DBEAFE; color: #1D4ED8; }
.status-progress { background: #E0E7FF; color: #4338CA; }
.status-completed { background: #ECFDF5; color: #059669; }
.status-cancelled { background: #FEE2E2; color: #DC2626; }

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
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.location-icon svg { width: 14px; height: 14px; }
.pickup-icon { background: var(--primary-100); color: var(--primary-600); }
.delivery-icon { background: var(--success-bg); color: var(--success); }

.location-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.location-label { font-size: 11px; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.05em; }
.location-text { font-size: 14px; color: var(--slate-700); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Meta 行 */
.meta-row {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-3);
  border-top: 1px dashed var(--slate-200);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.meta-label { font-size: 11px; color: var(--slate-400); }
.meta-value { font-size: 14px; color: var(--slate-700); font-weight: 600; }
.meta-value.reward { color: var(--primary-600); }

/* 联系方式 */
.contact-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding-top: var(--space-3);
  padding-bottom: var(--space-2);
}

.contact-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--info-bg);
  color: var(--info);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.contact-icon svg { width: 14px; height: 14px; }

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.contact-label { font-size: 11px; color: var(--slate-400); text-transform: uppercase; }
.contact-value { font-size: 14px; color: var(--slate-700); font-weight: 600; }

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .tab-segment { background: var(--slate-800); }
  .tab-btn.active { background: var(--slate-700); box-shadow: var(--elevation-1); }
  .order-card-inner { border-color: var(--slate-700); }
  .meta-row { border-top-color: var(--slate-700); }
}
</style>
